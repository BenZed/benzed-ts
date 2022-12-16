import { $$copy } from '@benzed/immutable'
import { Func, IndexesOf, isFunc, isNumber, isTruthy as isNotEmpty, keysOf, nil, property } from '@benzed/util'
import Path, { ModuleAtNestedPath, NestedPathsOf, path } from '../node/path'
import { Fill, MethodsOf } from '../types'

import Module, { ModuleArray } from './module'
import { 
    addModules,
    removeModule, 
    swapModules, 
    setModule, 
    insertModule, 
     
    unparent
} from './module-operations'

import { 
    isSingle
} from './module-assertions'

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

    static assert = {
        isSingle
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

    get<I extends IndexesOf<M>>(index: I): M[I]
    get<P extends NestedPathsOf<M>>(path: P): ModuleAtNestedPath<M, P> 
    get(at: path | number) : Module {
        return isNumber(at) 
            ? this._getModuleAtIndex(at)
            : this._getModuleAtPath(at)
    }

    override validate(): void {
        for (const module of this)
            module.validate()
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

    //// Helper ////

    _getModuleAtIndex(index: number): Module {
        const module = this.modules.at(index)
        if (!module)
            throw new Error(`Invalid index: ${index}`)

        return module
    }

    _getModuleAtPath(nestedPath: path): Modules {

        let modules = this as Modules | nil
        
        const paths = nestedPath
            .split('/')
            .filter(isNotEmpty)
            .map(path => `/${path}`) as path[]

        for (const path of paths) {
            modules = modules?.modules.find(child => 
                child instanceof Modules && 
                child.modules.find((grandChild: Module) => 
                    grandChild instanceof Path && 
                    grandChild.path === path)
            ) as Modules | nil
        }
 
        if (!modules)
            throw new Error(`Invalid path: ${nestedPath}`)

        return modules
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
    ModulesOf,
    ModulesInterface
}