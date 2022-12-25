import { $$copy, $$equals, CopyComparable, equals } from '@benzed/immutable'
import { callable, isObject } from '@benzed/util'

import { Node } from './node'
import { Validatable } from './validatable'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

export const $$isModuleConstructor = Symbol('is-module-constructor')

//// Module ////

export type Modules = readonly Module[]

export class Module<T = unknown> extends Validatable implements CopyComparable {

    /**
     * @internal
     */
    static readonly [$$isModuleConstructor] = true

    static isModule(input: unknown): input is Module {
        return callable.isInstance(input, Module as unknown as (new () => Module))
    }

    constructor(
        readonly data: T
    ) {
        super()
    }
    
    get name(): string {
        return this.constructor.name
    }

    /**
     * @internal
     */
    static _refs = new WeakMap<Module, Node>

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

    _setNode(parent: Node): void {
        if (this.hasNode)
            throw new Error(`${this.name} is already parented`)

        if (!parent.modules.includes(this))
            throw new Error(`${this.name} is not included in given parent\'s children.`)

        Module._refs.set(this, parent)
        this.validate()
    }

    validate(): void { /**/ }

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