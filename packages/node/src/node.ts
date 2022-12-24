
import { 
    callable,
    isString, 
    nil,
} from '@benzed/util'

import { isValidateable, Module } from './module'

import { 
    AssertNode, 
    Finder, 
    FindFlag, 
    FindInput, 
    FindNode, 
    FindOutput, 
    HasNode 
} from './find'

import type { NodeArray, NodeSet } from './node-set'
import type { NodeMap, NodeRecord } from './node-map'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/no-var-requires,
*/
//// Symbols ////

export const $$isNodeConstructor = Symbol('is-node-constructor')

//// Exports ////

class Node<T = unknown> extends Module<T> {

    static isNode(input: unknown): input is Node {
        return callable.isInstance(input, Node)
    }

    static for(input: object): Node | nil {
        return Module._parents.get(input)
    }

    static from<Tx extends NodeArray>(...nodes: Tx): NodeSet<Tx>
    static from<Tx extends NodeRecord>(record: Tx): NodeMap<Tx>
    static from<Tx>(value: Tx): Node<Tx> 
    
    static from(...values: unknown[]): unknown {
        if (values.length === 0)
            throw new Error('Node must have a value.')

        const { isNodeArray, NodeSet } = require('./node-set')
        if (values.length > 1) 
            return isNodeArray(values) ? new NodeSet(...values) : new Node(values)

        const { isNodeRecord, NodeMap } = require('./node-map')
        const [ value ] = values
        return isNodeRecord(value) ? new NodeMap(value) : new Node(value)
    }

    static * eachChild(value: unknown): IterableIterator<Node> {
        for (const ref of this._eachRef(value)) {
            if (Node.isNode(ref))
                yield ref
        }
    }

    /**
     * @internal 
     */
    static readonly [$$isNodeConstructor] = true as const

    //// Construct ////

    constructor(value: T) {

        super(value)

        for (const ref of Node._eachRef(this._value))
            Module._setParent(ref, this)

    }

    //// Relationships ////

    * eachSibling(): IterableIterator<Node> {
        if (this.hasParent) {
            for (const child of this.parent.eachChild()) {
                if (child !== this)
                    yield child
            }
        }
    }
    get siblings(): Node[] {
        return Array.from(this.eachSibling())
    }
    get numSiblings(): number {
        return this.siblings.length
    }

    * eachParent(): IterableIterator<Node> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let current: Pick<Node, 'hasParent' | 'parent'> = this
        while (current.hasParent) {
            yield current.parent
            current = current.parent
        }
    }
    get parents(): Node[] {
        return Array.from(this.eachParent())
    }
    get numParents(): number {
        return this.parents.length
    }

    * eachAncestor(): IterableIterator<Node> {
        for (const parent of this.eachParent()) {
            yield parent
            yield* parent.eachSibling()
        }
    }
    get ancestors(): Node[] {
        return Array.from(this.eachAncestor())
    } 
    get numAncestors(): number {
        return this.ancestors.length
    }
    get root(): Node {
        return this.parents.at(-1) ?? this
    }

    * eachChild(): IterableIterator<Node> {
        yield* Node.eachChild(this._value)
    }

    get children(): Node[] {
        return Array.from(this.eachChild())
    }
    get numChildren(): number {
        return this.children.length
    }
    get hasChildren(): boolean {
        return this.children.length === 0
    }

    * eachDescendent(): IterableIterator<Node> {
        for (const child of this.eachChild()) {
            yield child
            if (child instanceof Node)
                yield* child.eachDescendent()
        }
    }
    get descendents(): Node[] {
        return Array.from(this.eachDescendent())
    }
    get numDescendents(): number {
        return this.descendents.length
    }

    /**
     * @internal
     */
    get _refs(): object[] {
        return Array.from(Node._eachRef(this._value))
    }

    //// Find ////

    get find(): FindNode {
        return new Finder(this)
    }
    get has(): HasNode {
        return new Finder(this, FindFlag.Has)
    }
    assert<T extends FindInput>(input: T): FindOutput<T>
    assert(error?: string): AssertNode
    assert(input?: FindInput | string): FindOutput<FindInput> | AssertNode {

        const isError = isString(input)
        const error = isError ? input : undefined

        const finder = new Finder(this, FindFlag.Require, error)

        const isFindInput = !isError && input
        return (isFindInput ? finder(input) : finder) as FindOutput<FindInput> | AssertNode
    }
    
    //// Validate ////

    /**
     * Called when the module is parented.
     */
    validate(): void { 
        for (const ref of Module._eachRef(this._value)) {
            if (isValidateable(ref))
                ref.validate()
        }
    }

}

//// Exports ////

export default Node 

export {
    Node
}