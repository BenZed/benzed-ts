import { $$copy, equals } from '@benzed/immutable'
import { 
    Func, 
    isFunc,

    IndexesOf,
    
    keysOf, 
    property,
    IsIdentical,

} from '@benzed/util'

import { Fill, MethodsOf } from '../types'

import Module, { ModuleArray } from '../module'

import { 
    addModules,
    removeModule, 
    swapModules, 
    setModule, 
    insertModules, 
     
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

type ModulesInterface<M extends ModuleArray, I extends Modules<M>> = Fill<I, _InheritModuleMethods<M>>

//// Main ////

class Modules<M extends ModuleArray = ModuleArray> extends Module<M> implements Iterable<M[number]> {

    static add = addModules
    static insert = insertModules
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
     * Alias for children
     */
    get modules(): M {
        return this.state
    }

    get numModules(): M['length'] {
        return this.state.length
    }

    * eachChild(): IterableIterator<Module> {
        yield* this.state
    }

    get children(): Module[] {
        return Array.from(this.eachChild())
    }

    get numChildren(): number {
        return this.numModules
    }

    * eachDescendent(): IterableIterator<Module> {
        for (const child of this.eachChild()) {
            yield child
            if (child instanceof Modules)
                yield* child.eachDescendent()
        }
    }

    get descendents(): Module[] {
        return Array.from(this.eachDescendent())
    }

    get numDescendents(): number {
        return this.descendents.length
    }

    constructor(...modules: M) {
        super(modules.map(m => m._clearParent()) as ModuleArray as M)
        for (const module of this) 
            module._setParent(this)
    }

    //// Interface ////

    get<I extends IndexesOf<M>>(index: I): GetModule<M,I> {
        return Modules.get(this.modules, index)
    }

    override validate(): void {
        for (const module of this.modules)
            module.validate()
    }

    //// Iterable Implementation ////
    
    *[Symbol.iterator](): Iterator<Module> {
        yield* this.state
    }

    //// CopyComparable ////

    [$$copy](): this {
        const Constructor = this.constructor as new (...modules: M) => this
        return new Constructor(...this.state)
    }

}

//// Another Helper State Class ////

type _GetKeyState<M, K> = M extends [infer M1, ...infer Mr ]
    ? M1 extends KeyState<infer Kx, infer T> 
        ? IsIdentical<K, Kx> extends true 
            ? T
            : _GetKeyState<Mr, K>
        : _GetKeyState<Mr, K>
    : never

export type GetState<M, K> = M extends ModuleArray
    ? _GetKeyState<M, K>
    : M extends Modules<infer Mm> 
        ? _GetKeyState<Mm, K>
        : never

export class KeyState<K, T> extends Module<T> {

    constructor(readonly key: K, state: T) {
        super(state)
    }

    getState<M extends Modules>(this: M, key: K): GetState<M, K> {
        return this
            .parent
            .assert(`No state with key ${key}`)
            .inChildren((m): m is KeyState<K, GetState<M, K>> => m instanceof KeyState && equals(m.key, key))
            .state
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