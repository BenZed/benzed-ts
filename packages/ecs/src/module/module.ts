import { $$copy, $$equals, CopyComparable, equals } from '@benzed/immutable'
import { callable, isObject } from '@benzed/util'

import { Node } from '../node'

import type { Data, Execute, ExecuteHook } from '../modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-var-requires
*/

export const $$isModuleConstructor = Symbol('is-module-constructor')

//// Module ////

export type Modules = readonly Module[]

export class Module<T = unknown> implements CopyComparable {

    static get Data(): typeof Data {
        return require('../modules').Data
    }

    static get Execute(): typeof Execute {
        return require('../modules').Execute
    }

    /**
     * Create a module with generic get/set state setters
     */
    static data<T>(data: T): Data<T> {
        const { Data } = Module
        return new Data(data)
    }

    static execute <I, O, C = void>(execute: ExecuteHook<I,O,C>): Execute<I, O, C> {
        const { Execute } = this
        return new Execute(execute)
    }

    /**
     * @internal
     */
    static readonly [$$isModuleConstructor] = true

    static isModule(input: unknown): input is Module {
        return callable.isInstance(input, Module as unknown as (new () => Module))
    }

    constructor(readonly data: T) {}
    
    get name(): string {
        return this.constructor.name
    }

    /**
     * @internal
     */
    static _refs = new WeakMap<Module | Node, Node>

    //// Parents ////
    
    get node(): Node {
        const node = Module._refs.get(this)
        if (!node)
            throw new Error(`${this.name} does not have a node.`)

        return node
    }

    get hasNode(): boolean {
        return Module._refs.has(this)
    }

    _setNode(node: Node): void {

        if (node.modules.indexOf(this) !== node.modules.lastIndexOf(this))
            throw new Error(`${node} may only have a single reference of a module.`)

        if (this.hasNode)
            throw new Error(`${this} already has a node`)

        if (!node.modules.includes(this))
            throw new Error(`${this} is not included in ${node}'s modules.`)

        Module._refs.set(this, node)
    }

    validate(): void { /**/ }

    toString(): string {
        return this.constructor.name
    }

    //// CopyComparable Interface ////

    [$$equals](input: unknown): input is this {
        return isObject(input) && 
            input instanceof Module && 
            input.constructor === this.constructor && 
            equals(this.data, input.data)
    }

    [$$copy](): this {
        const Module = this.constructor as new (data: T) => this
        return new Module(this.data)
    }

}