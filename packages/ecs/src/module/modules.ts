import { $$copy } from '@benzed/immutable'
import { Func, IndexesOf, isFunc, keysOf, property } from '@benzed/util'
import { Fill, MethodsOf } from '../types'

import Module, { ModuleArray } from './module'
import { addModules, removeModule, swapModules, setModule, unparent, insertModule } from './module-operations'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

//// Constants ////

//// Types ////

/**
 * A node's interface is comprised of public methods of it's modules.
 */
type _InheritModuleMethods<M> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Fill<MethodsOf<Mx>, _InheritModuleMethods<Mr>>
        : _InheritModuleMethods<Mr>
    : {}

//// Definition ////

type ModulesInterface<I extends Modules<M>, M extends ModuleArray> = 
    Fill<I, _InheritModuleMethods<M>>

//// Main ////

class Modules<M extends ModuleArray> extends Module<M> implements Iterable<M[number]> {

    static add = addModules

    static insert = insertModule

    static set = setModule

    static remove = removeModule

    static swap = swapModules

    static applyInterface<M extends Modules<any>>(modules: M): M {

        const { descriptorsOf, prototypeOf, define } = property
  
        const modulesDescriptors = descriptorsOf(prototypeOf(modules))
        const applyDescriptors: PropertyDescriptorMap = {}
 
        for (const module of modules.modules) {
            
            const moduleDescriptors = descriptorsOf(prototypeOf(module))
            for (const key of keysOf(moduleDescriptors)) { 

                const isPrivate = key.startsWith('_')
                const isConstructor = key === 'constructor'
                const isAlreadyDefined = key in applyDescriptors || key in modulesDescriptors
                const isFunction = 'value' in moduleDescriptors[key] && isFunc(moduleDescriptors[key].value)

                if (
                    !isPrivate && 
                    !isConstructor && 
                    !isAlreadyDefined && 
                    isFunction
                ) {
                    applyDescriptors[key] = {
                        ...moduleDescriptors[key],
                        value: wrapNodeInterfaceMethod(module, key)
                    }
                }
            }
        }

        return define(modules, applyDescriptors)
    }
    
    //// State ////
    
    /**
     * Get children of this module.
     */
    override get modules(): M {
        return this.state
    }

    constructor(...modules: M) {

        super(modules)

        for (const module of this) 
            module._setParent(this)
        
    }

    //// Interface ////

    get<I extends IndexesOf<M>>(index: I): M[I] {
        const module = this.modules.at(index)
        if (!module)
            throw new Error('Invalid index.')

        return module
    }

    //// Iterable Implementation ////
    
    *[Symbol.iterator](): Iterator<M[number]> {
        yield* this.state
    }

    //// CopyComparable ////

    [$$copy](): this {
        const Constructor = this.constructor as new (...modules: M) => this
        return new Constructor(...unparent(this.state))
    }

}

//// Helper ////

function wrapNodeInterfaceMethod(module: Module, methodName: string): Func {

    const methodDeferred = (...args: unknown[]): unknown => 
        (module as unknown as { [key: string]: Func })
            [methodName]
            (...args)

    return property.name(
        methodDeferred, 
        methodName
    )
}

//// Exports ////

export default Modules

export {
    Modules,
    ModulesInterface
}