import { callable, isArray, isFunc, isObject, isString, iterate } from '@benzed/util'

import { Node } from '../node'
import { Type } from './type'
import { isValidateable, Validateable } from './validateable'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

function nameOf(input: object, defaultName = 'object'): string {
    return 'name' in input && isString(input.name)
        ? input.name 
        : 'constructor' in input && isObject(input.constructor)
            ? nameOf(input.constructor, defaultName)
            : defaultName
}

//// Module ////

export abstract class Module<T = unknown> extends Type<T> implements Validateable {
    
    get name(): string {
        return this.constructor.name
    }

    /**
     * @internal
     */
    protected static _parents = new WeakMap<object, Node>

    /**
     * @internal
     */
    static _setParent(child: object, parent: Node, name = nameOf(child)): void {
        if (this._parents.has(child))
            throw new Error(`${name} is already parented`)

        if (!parent._refs.includes(child))
            throw new Error(`${name} is not included in given parent\'s children.`)

        this._parents.set(child, parent)
        if (isValidateable(child))
            child.validate()
    }

    /**
     * @internal
     */
    static _isModule(input: unknown): input is Module {
        return callable.isInstance(input, Module as any)
    }

    /**
     * @internal
     */
    static * _eachRef(value: unknown): IterableIterator<object> {

        if (!isObject(value) && !isFunc(value)) 
            return
  
        if (Module._isModule(value))
            return yield value 

        if (isArray(value))
            yield* value.filter(v => isObject(v) || isFunc(v)) as object[]
    
        else 
            yield* Array.from(iterate(value)).filter(Module._isModule)

    }
  
    //// Parents ////
    
    get parent(): Node {
        const parent = Module._parents.get(this)
        if (!parent)
            throw new Error(`${this.name} does not have a parent. Use .hasParent to check, first.`)

        return parent
    }

    get hasParent(): boolean {
        return Module._parents.has(this)
    }

    /**
     * Called when child is mounted.
     */
    abstract validate(): void

}