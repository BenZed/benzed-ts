import { $$copy } from '@benzed/immutable'
import { 
    Func, 
    isFunc,

    IndexesOf,
    
    keysOf, 
    property,
    nil,
    callable,

} from '@benzed/util'

import { Fill } from '../types'
import Module, { ModuleArray } from '../module/module'

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

import { hasChildren } from '../find'
import { Data } from './data'

/* eslint-disable 
    @typescript-eslint/ban-types,
    @typescript-eslint/no-explicit-any
*/

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
type _InheritModuleMethods<M> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? Fill<_InheritableMethods<Mx>, _InheritModuleMethods<Mr>>
        : _InheritModuleMethods<Mr>
    : {}

type _FlattenModule<M> = M extends Modules<infer Mx> 
    ? FlattenModules<Mx>
    : M extends Module 
        ? [M]
        : []

type _CallableModule<M> = 
    FlattenModules<M> extends [infer M1, ...infer Mr]
        ? M1 extends Func
            ? (...args: Parameters<M1>) => ReturnType<M1> 
            : _CallableModule<Mr>
        : (x: never) => never

//// Definition ////

type ModulesOf<I extends Modules<ModuleArray>> = I extends Modules<infer M> ? M : []

type ModulesInterface<M extends ModuleArray, I extends Modules<M>> = 
    Fill<I, _InheritModuleMethods<M>> & _CallableModule<M>

type FlattenModules<M> = M extends Modules<infer Mx> 
    ? FlattenModules<Mx>
    : M extends [infer Mx, ...infer Mr]
        ? [..._FlattenModule<Mx>, ...FlattenModules<Mr>]
        : []
        
//// Main ////

abstract class Modules<M extends ModuleArray = ModuleArray> 
    extends Module<M> 
    implements Iterable<M[number]> {

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

    static flatten<M extends ModuleArray>(modules: M): FlattenModules<M> {
        return modules.flatMap(m => hasChildren(m) 
            ? Modules.flatten(m.modules) 
            : m
        ) as FlattenModules<M>
    }

    static applyInterface<M extends Modules<any>>(modules: M): M {

        const { descriptorsOf, prototypesOf, define } = property

        const blacklist = [Object.prototype, Module.prototype, Modules.prototype]
  
        const modulesDescriptors = descriptorsOf( 
            ...prototypesOf(modules, blacklist)
        )
        const applyDescriptors: PropertyDescriptorMap = {}
        
        let signature: Func | nil = nil
        for (const module of Modules.flatten(modules.modules)) {  
            
            const descriptors = descriptorsOf(...prototypesOf(module, blacklist))
            for (const key of keysOf(descriptors)) { 
                const descriptor = descriptors[key]

                const isPrivate = key.startsWith('_')
                const isAlreadyDefined = key in applyDescriptors || key in modulesDescriptors
                const isFunction = isFunc(descriptor.value)

                if (
                    !isPrivate && 
                    !isAlreadyDefined && 
                    isFunction
                ) {
                    applyDescriptors[key] = {
                        ...descriptor,
                        enumerable: true,
                        value: wrapInterfaceMethod(module, descriptor)
                    }
                }
            }

            if (isFunc(module) && !signature)
                signature = module
        }

        define(modules, applyDescriptors)

        return signature 
            ? callable(wrapMethod(signature, signature), modules) as unknown as M 
            : modules

    }

    /**
     * Alias for children
     */
    get modules(): M {
        return this.data
    }
    get numModules(): M['length'] {
        return this.data.length
    }

    * eachChild(): IterableIterator<Module> {
        yield* this.data
    }
    get children(): Module[] {
        return Array.from(this.eachChild())
    }
    get numChildren(): M['length'] {
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
        yield* this.data
    }

    //// Copyable ////

    override [$$copy](): this {
        const Constructor = this.constructor as new (...modules: M) => this
        return new Constructor(...this.data)
    }

}

//// Helper ////

function wrapMethod(method: Func, thisArg: object): Func {
    return (...input: unknown[]): unknown => {
        const output = method.apply(thisArg, input)
        if (callable.isInstance(output, Module as typeof Data)) {
        // this shouldn't happen, as functions that return modules arn't inherited
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

export default Modules

export {
    Modules,
    ModulesOf,
    ModulesInterface,
    FlattenModules
}