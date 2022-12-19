
import { 

    equals, 
    $$equals, 

    $$copy,

    CopyComparable,

} from '@benzed/immutable'

import {
    isObject,
    isString,
    nil,
} from '@benzed/util'

import { 
    Finder, 
    FindModule, 
    FindFlag, 
    
    AssertModule, 
    HasModule, 
    FindInput,
    FindOutput
} from './find'

import type { 
    Data,
    KeyData, 
    Modules 
} from './modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

//// Constants ////

const $$isModuleConstructor = Symbol('is-module-constructor')

//// Types ////

export type ModuleArray = readonly Module<any>[]

//// Errors ////

class InvalidParentError extends Error {
    constructor(msg: string) {
        super(`${msg}: ${Module.prototype._setParent.name} method should only be called internally.`)
    }
}

//// Private ////

/**
 * Parents are stored a weak map as opposed to private method for two reasons:
 * - to prevent Node from complaining about not fulfilling the contract of private methods (because of the ModuleInterface trickery)
 * - to allow any arbitrary deep-equal method to work on modules and nodes
 */
const _parents = new WeakMap<Module, nil | Modules>

//// Definition ////

abstract class Module<D = unknown> implements CopyComparable {

    static get Data(): typeof Data {
        return require('./modules').Data
    }

    static get KeyData(): typeof KeyData {
        return require('./modules').KeyData
    }

    /**
     * Create a module with generic get/set state setters
     */
    static data<T>(data: T): Data<T> 
    static data<K extends string,T>(key: K, state: T): KeyData<K,T>
    static data(...args: unknown[]): Module<unknown> {
        
        const $$none = Symbol('no-key-provided')

        const [key, value] = args.length === 1 ? [$$none, ...args] : args
        const { Data, KeyData } = Module

        return key === $$none 
            ? new Data(value)
            : new KeyData(key, value)
    }

    /**
     * @internal
     * Allows the find() method to differentiate between type guards and module constructors,
     * ensuring edge cases:
     * - modules extended by callable
     * - function () {} typeguards
     */
    protected static readonly [$$isModuleConstructor] = true

    //// Data ////
    
    constructor(readonly data: D) {}

    get name(): string {
        return this.constructor.name
    }

    //// Relationships ////

    get parent(): Modules {
        const parent = _parents.get(this)
        if (!parent)
            throw new Error(`${this.name} does not have a parent. Use .hasParent() to check, first.`)

        return parent
    }

    get hasParent(): boolean {
        return _parents.has(this)
    }

    /**
     * @internal
     */
    _setParent(newParent: Modules): this {
    
        if (this.hasParent)
            throw new InvalidParentError('Parent already set')
   
        const module = this as unknown as Module

        if (!newParent.modules.includes(module))
            throw new InvalidParentError('Parent invalid')
    
        if (newParent.modules.indexOf(module) !== newParent.modules.lastIndexOf(module))
            throw new Error( 'Parent may only contain single reference of child')
    
        _parents.set(this, newParent)
        this.validate()
        return this
    }

    /**
     * @internal
     */
    _clearParent(): this {
        return this.hasParent ? this[$$copy]() : this
    } 

    //// Relationships ////

    * eachSibling(): IterableIterator<Module> {
        if (this.hasParent) {
            for (const child of this.parent.eachChild()) {
                if (child !== this)
                    yield child
            }
        }
    }

    get siblings(): ModuleArray {
        return Array.from(this.eachSibling())
    }

    get numSiblings(): number {
        return this.siblings.length
    }

    * eachParent(): IterableIterator<Modules> {
        let current: Pick<Module, 'hasParent' | 'parent'> = this
        while (current.hasParent) {
            yield current.parent
            current = current.parent
        }
    }

    get parents(): Modules[] {
        return Array.from(this.eachParent())
    }

    get numParents(): number {
        return this.parents.length
    }

    * eachAncestor(): IterableIterator<Module | Modules> {
        for (const parent of this.eachParent()) {
            yield parent
            yield* parent.eachSibling()
        }
    }

    get ancestors(): (Module | Modules)[] {
        return Array.from(this.eachAncestor())
    } 

    get numAncestors(): number {
        return this.ancestors.length
    }

    get root(): Module | Modules {
        return this.parents.at(-1) ?? this
    }

    //// Find interface ////

    get find(): FindModule {
        return new Finder(this)
    }

    get has(): HasModule {
        return new Finder(this, FindFlag.Has) as HasModule
    }

    assert<T extends FindInput>(input: T): FindOutput<T>
    assert(error?: string): AssertModule
    assert(input?: FindInput | string): FindOutput<FindInput> | AssertModule {

        const isError = isString(input)
        const error = isError ? input : undefined

        const finder = new Finder(this, FindFlag.Require, error)

        const isFindInput = !isError && input
        return (isFindInput ? finder(input) : finder) as FindOutput<FindInput> | AssertModule
    }

    //// Validate ////
    
    /**
     * Called when the module is parented.
     */
    validate(): void { /**/ }

    //// CopyComparable Interface ////

    [$$equals](input: unknown): input is this {
        return isObject(input) && 
            input instanceof Module && 
            input.constructor === this.constructor && 
            equals(this.data, input.data)
    }

    [$$copy](): this {
        const Constructor = this.constructor as new (modules: D) => this
        return new Constructor(this.data)
    }

}

//// Exports ////

export default Module 

export {
    Module,
    $$isModuleConstructor
}