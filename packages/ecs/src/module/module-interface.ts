import { 
    Func, 
    isFunc,

    keysOf, 
    property,
    nil,
    callable,

} from '@benzed/util'

import { Fill } from '../types'

import { Data } from '../modules'
import { Module, Modules } from './module'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Constants ////

const BLACKLIST = [Object.prototype, Module.prototype]

//// Types ////

type _InheritableMethodKey<M extends Module, K extends keyof M> = M[K] extends Func 
    ? ReturnType<M[K]> extends Module 
        ? never 
        : K 
    : never

type _InheritableMethods<M extends Module> = {

    [K in keyof M as _InheritableMethodKey<M, K>]: M[K]

}

/**
 * A node's interface is comprised of public methods of it's modules.
 */
type _ModuleMethods<M> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Fill<_InheritableMethods<Mx>, _ModuleMethods<Mr>>
        : _ModuleMethods<Mr>
    : {}

type _ModuleCallSignature<M> = 
    M extends [infer M1, ...infer Mr]
        ? M1 extends Func
            ? (...args: Parameters<M1>) => ReturnType<M1> 
            : _ModuleCallSignature<Mr>
        : (x: never) => never

//// Definition ////

type ModulesInterface<M extends Modules, O extends object> = 
    Fill<O, _ModuleMethods<M>> & _ModuleCallSignature<M>

//// Main ////

function applyModulesInterface<O extends object, M extends Modules>(object: O, modules: M): ModulesInterface<M, O> {

    const { descriptorsOf, prototypesOf, define } = property
  
    const objectDescriptors = descriptorsOf( 
        ...prototypesOf(object, BLACKLIST)
    )
    const moduleDescriptors: PropertyDescriptorMap = {}
        
    let signature: Func | nil = nil
    for (const module of modules) {  
            
        const descriptors = descriptorsOf(...prototypesOf(module, BLACKLIST))
        for (const key of keysOf(descriptors)) { 
            const descriptor = descriptors[key]

            const isPrivate = key.startsWith('_')
            const isAlreadyDefined = key in moduleDescriptors || key in objectDescriptors
            const isFunction = isFunc(descriptor.value)

            if (
                !isPrivate && 
                    !isAlreadyDefined && 
                    isFunction
            ) {
                moduleDescriptors[key] = {
                    ...descriptor,
                    enumerable: true,
                    value: wrapInterfaceMethod(module, descriptor)
                }
            }
        }

        if (isFunc(module) && !signature)
            signature = module
    }

    define(object, moduleDescriptors)

    return (signature 
        ? callable(wrapMethod(signature, signature), object)
        : object
    ) as ModulesInterface<M, O>
}

//// Helper ////

function wrapMethod(method: Func, thisArg: object): Func {
    return (...input: unknown[]): unknown => {
        const output = method.apply(thisArg, input)
        if (callable.isInstance(output, Module as typeof Data)) {
            throw new Error(
                'deffered usage of immutable methods not yet supported'
            )
        }
            
        return output
    }
}

function wrapInterfaceMethod(module: Module, descriptor: PropertyDescriptor): Func {

    const method = descriptor.value 
    const methodDeferred = wrapMethod(method, module)

    return property.name(
        methodDeferred, 
        method.name
    )
}

//// Exports ////

export default applyModulesInterface

export {
    Modules,
    ModulesInterface,
}