import { $$copy } from '@benzed/immutable'
import { 
    Func, 
    isFunc,

    IndexesOf,
    
    keysOf, 
    property,

} from '@benzed/util'

import { Fill, MethodsOf } from '../types'

import Module, { ModuleArray } from '../module'

import { 
    addModules,
    removeModule, 
    swapModules, 
    setModule, 
    insertModule, 
     
    unparent,
    getModule,
    GetModule
} from './operations'

import { 
    isSingle,
    isRootLevel
} from './assertions'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

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

type ModulesOf<I extends Modules<ModuleArray>> = I extends Modules<infer M> ? M : []

type ModulesInterface<I extends Modules<ModuleArray>> = 
    Fill<I, _InheritModuleMethods<ModulesOf<I>>>

//// Main ////

class Modules<M extends ModuleArray = ModuleArray> extends Module<M> implements Iterable<M[number]> {

    static add = addModules
    static insert = insertModule
    static set = setModule
    static remove = removeModule
    static swap = swapModules
    static get = getModule

    static assert = {
        isSingle,
        isRootLevel
    } as const

    static applyInterface<M extends Modules<any>>(modules: M): M {

        const { descriptorsOf, prototypesOf, define } = property
  
        const modulesDescriptors = descriptorsOf(...prototypesOf(modules, [Module.prototype]))
        const applyDescriptors: PropertyDescriptorMap = {}
 
        for (const module of modules.modules) {
            
            const moduleDescriptors = descriptorsOf(...prototypesOf(module, [Module.prototype]))
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
    get modules(): M {
        return this.state
    }

    constructor(...modules: M) {

        super(modules)

        for (const module of this) 
            module._setParent(this)
        
    }

    //// Interface ////

    get<I extends IndexesOf<M>>(index: I): GetModule<M,I> {
        return Modules.get(this.modules, index)
    }

    override validate(): void {
        for (const module of this)
            module.validate()
    }

    //// Iterable Implementation ////
    
    *[Symbol.iterator](): Iterator<Module> {
        yield* this.state
    }

    //// CopyComparable ////

    [$$copy](): this {
        const Constructor = this.constructor as new (...modules: M) => this
        return new Constructor(...this.state.map(unparent) as ModuleArray as M)
    }

    //// Helper ////

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
    ModulesOf,
    ModulesInterface
}