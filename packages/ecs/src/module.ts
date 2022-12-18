
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
import { assert } from 'console'

import { 
    Finder, 
    FindModule, 
    FindFlag, 
    
    AssertModule, 
    HasModule, 
    hasChildren,
    FindInput,
    FindOutput
} from './find'

import type { 
    KeyState, 
    Modules 
} from './modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
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

class Module<S = unknown> implements CopyComparable {

    /**
     * Create a module with generic get/set state setters
     */
    static for<T>(state: T): State<T> 
    static for<K,T>(key: K, state: T): KeyState<K,T>
    static for(...args: unknown[]): Module<unknown> {
        
        const $$none = Symbol('no-key-provided')

        const [key, value] = args.length === 1 ? [$$none, ...args] : args

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const _KeyState = require('./modules').KeyState as typeof KeyState
        //    ^ prevent circular references

        return key === $$none 
            ? new State(value)
            : new _KeyState(key, value)
    }

    /**
     * @internal
     * Allows the find() method to differentiate between type guards and module constructors,
     * ensuring edge cases:
     * - modules extended by callable
     * - function () {} typeguards
     */
    protected static readonly [$$isModuleConstructor] = true

    //// State ////
    
    constructor(readonly state: S) {}

    get name(): string {
        return this.constructor.name
    }

    /**
     * Parent of this node.
     * Throws if parent has not yet been set.
     */
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

    * eachParent(): IterableIterator<Modules> {
        let current: Module = this
        while (current.hasParent) {
            yield current.parent
            current = current.parent
        }
    }

    get parents(): Module[] {
        return Array.from(this.eachParent())
    }

    * eachAncestor(): IterableIterator<Module> {
        for (const parent of this.eachParent()) {
            yield parent
            yield* parent.eachSibling()
        }
    }

    get ancestors(): Module[] {
        return Array.from(this.eachAncestor())
    }

    /**
     * Root module of this node. 
     * Self if node is unparented.
     */
    get root(): Module {
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
    validate(): void {
        //
    }

    //// CopyComparable Interface ////

    [$$equals](input: unknown): input is this {
        return isObject(input) && 
            input instanceof Module && 
            input.constructor === this.constructor && 
            equals(this.state, input.state)
    }

    [$$copy](): this {
        const Constructor = this.constructor as new (modules: S) => this
        return new Constructor(this.state)
    }

}

/**
 * I'm going to use this a lot.
 */
export class State<T> extends Module<T> {

    setState<Tx>(newState: Tx): State<Tx>{
        return new State(newState)
    }

    getState(): T {
        return this.state
    }

}

//// Exports ////

export default Module 

export {
    Module,
    $$isModuleConstructor
}