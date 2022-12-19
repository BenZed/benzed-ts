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
    insertModules, 
     
    getModule,
    GetModule
} from './operations'

import { 
    isSingle,
    isRootLevel
} from './assertions'
import { hasChildren } from '../find'

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

class Modules<M extends ModuleArray = ModuleArray> 
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

    static flatten(modules: ModuleArray): ModuleArray {
        return modules.flatMap(m => hasChildren(m) 
            ? Modules.flatten(m.modules) 
            : m
        )
    }

    static applyInterface<M extends Modules<any>>(modules: M): M {

        const { descriptorsOf, prototypesOf, define } = property
  
        const modulesDescriptors = descriptorsOf(
            ...prototypesOf(modules, [Object.prototype, Module.prototype, Modules.prototype])
        )
        const applyDescriptors: PropertyDescriptorMap = {}
 
        for (const module of Modules.flatten(modules.modules)) {  
            
            const descriptors = descriptorsOf(...prototypesOf(module, [Object.prototype, Module.prototype, Modules.prototype]))
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
                        value: wrapNodeInterfaceMethod(module, descriptor)
                    }
                }
            }
        }

        return define(modules, applyDescriptors)
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

const $$wrapped = Symbol('wrapped-node-interface-method')

function wrapNodeInterfaceMethod(module: Module, descriptor: PropertyDescriptor): Func {

    const method = $$wrapped in descriptor.value 
        ? descriptor.value[$$wrapped] 
        : descriptor.value

    const methodDeferred = (...args: unknown[]): unknown => method.apply(module, args)

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
    ModulesInterface
}