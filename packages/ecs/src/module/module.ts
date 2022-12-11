import { isString, TypeGuard, nil } from '@benzed/util'
import { $$copy, Copyable } from '@benzed/immutable'

import type { GenericNode } from '../node'

//// Types ////

export type FindModule<M extends Module> = M | TypeGuard<M, Module>

export type FindScope = 'parent' | 'siblings' | 'children'
export type path = `/${string | number}`

//// Definition ////

abstract class Module implements Copyable {

    get root(): GenericNode {
        throw new Error('Not yet implemented.')
    }

    private _parent: GenericNode | nil
    get parent(): GenericNode | nil {
        return this._parent
    }
    /**
     * @internal
     */
    _setParent(parent: GenericNode): void {
        if (this._parent)
            throw new Error('Parent has already been set.')
        this._parent = parent
    }

    get modules(): readonly Module[] {
        return this.parent?.modules ?? []
    }

    constructor(protected readonly _state: object) {}

    find<M extends Module>(type: FindModule<M>, scope: FindScope, required?: true): M[]
    find<M extends Module>(type: FindModule<M>, required?: boolean): M[]
    find(...args: unknown[]): Module[] {

        const [type, scope, required] = (isString(args[1]) 
            ? args 
            : [args[0], 'siblings', args[1]]) as [FindModule<Module>, FindScope | nil, boolean | nil ]

        return [...this.modules]
    }

    abstract toJSON(): object

    //// Helper ////

    [$$copy](): this {
        const Constructor = this.constructor as new (state: object) => this
        return new Constructor(this._state)
    }
}

//// Exports ////

export default Module 

export {
    Module
}