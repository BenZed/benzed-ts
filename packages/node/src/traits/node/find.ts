import { 
    AnyTypeGuard,
    Each,
    each,
    Func,
    isFunc,
    isShape,
    nil,
    TypeGuard,
    TypeOf
} from '@benzed/util'
import { Comparable } from '@benzed/immutable'
import { Function } from '@benzed/traits'

import { Node } from './node'
import { getPath } from './path'
import {
    eachAncestor,
    eachChild,
    eachDescendent,
    eachNode,
    eachParent,
    eachSibling
} from './relations'

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Helper Types////

type AnyNodeTrait = {
    is(input: unknown): input is Node
}
type AnyNodeTypeGuard = TypeGuard<Node, Node>
type AnyNodePredicate = (input: Node) => Node | boolean

//// Types ////

type FindInput = Node | AnyNodePredicate | AnyNodeTypeGuard | AnyNodeTrait
type FindOutput<I extends FindInput> = 
    I extends TypeGuard<infer Mx, Node>
        ? Mx 
        : I extends (input: Node) => infer M 
            ? Exclude<M extends Node ? M : Node, nil>
            : I extends AnyNodeTrait
                ? TypeOf<I['is']>
                : I extends Node 
                    ? I
                    : never

interface FindNode {

    <I extends FindInput>(input: I): FindOutput<I> | nil
    get inChildren(): FindNode
    get inSiblings(): FindNode
    get inDescendents(): FindNode
    get inParents(): FindNode
    get inAncestors(): FindNode
    get inNodes(): FindNode
    get or(): FindNode
    get all(): FindNodes

}

interface FindNodes {
    <I extends FindInput>(input: I): FindOutput<I>[]
    get inChildren(): FindNodes
    get inSiblings(): FindNodes
    get inDescendents(): FindNodes
    get inParents(): FindNodes
    get inAncestors(): FindNodes
    get inNodes(): FindNodes
    get or(): FindNodes
}

interface HasNode {
    <I extends FindInput>(input: I): boolean
    get inChildren(): HasNode
    get inSiblings(): HasNode
    get inDescendents(): HasNode
    get inParents(): HasNode
    get inAncestors(): FindNodes
    get inNodes(): FindNodes
    get or(): HasNode
}

interface AssertNode {
    <I extends FindInput>(input: I, error?: string): FindOutput<I>
    get inChildren(): AssertNode
    get inSiblings(): AssertNode
    get inDescendents(): AssertNode
    get inParents(): AssertNode
    get inAncestors(): AssertNode
    get inNodes(): AssertNode
    get or(): AssertNode
}

interface FindConstructor {
    new (source: Node): FindNode
    new (source: Node, flag: FindFlag.All): FindNodes
    new (source: Node, flag: FindFlag.Assert): AssertNode
    new (source: Node, flag: FindFlag.Has): HasNode
}

enum FindFlag {
    Assert = 0,
    Has = 1,
    All = 2
}

//// Implementation ////

const Find = class NodeFinder extends Function<Func> {

    constructor(
        readonly source: Node,
        private _flag?: FindFlag
    ) { 
        super(function find(this: NodeFinder, input: FindInput, error?: string) {
            return this._find(input, error)
        })
        this._each = eachChild(source)
    }

    //// Interface ////

    get or(): this {
        this._mergeOnIncrement = true 
        return this
    }

    get all(): this {
        this._flag = FindFlag.All
        return this
    }

    get inChildren(): this {
        return this._incrementEach(
            eachChild(this.source)
        )
    }

    get inSiblings(): this {
        return this._incrementEach(
            eachSibling(this.source)
        )
    }

    get inDescendents(): this {
        return this._incrementEach(eachDescendent(this.source))
    }

    get inParents(): this {
        return this._incrementEach(eachParent(this.source))
    }

    get inAncestors(): this {
        return this._incrementEach(eachAncestor(this.source))
    }

    get inNodes(): this {
        return this._incrementEach(eachNode(this.source))
    }

    //// Helper ////

    /**
     * @internal
     */
    _find(input: FindInput, error?: string): unknown {
        const predicate = toNodePredicate(input)

        const found = new Set<Node>()
        const { _flag: flag } = this

        iterators: for (const node of this._each) {

            if (found.has(node))
                continue

            const pass = predicate(node)
            if (pass)
                found.add(Node.is(pass) ? pass : node)

            if (pass && flag !== FindFlag.All)
                break iterators
        }

        const has = found.size > 0
        if (flag === FindFlag.Assert && !has) {
            throw new Error(
                error ?? `Node ${getPath(this.source).join('/')} Could not find node ${toNodeName(input)}`
            )
        }

        if (flag === FindFlag.Has)
            return has

        if (flag === FindFlag.All)
            return Array.from(found)

        const [first] = found
        return first
    }

    //// Iterators ////

    private _each: Each<Node>
    private _mergeOnIncrement = false
    private _incrementEach(...iterators: Iterable<Node>[]): this {

        this._each = this._mergeOnIncrement
            ? each(this._each, ...iterators)
            : each(...iterators)

        return this
    }

} as FindConstructor

//// Helper ////

// TODO should be exchanged with 'isGuardedConstructor'
const isNodeTrait: (input: unknown) => input is AnyNodeTrait = 
    isShape({
        is: isFunc as AnyTypeGuard
    })

function toNodePredicate(input: FindInput): AnyNodeTypeGuard | AnyNodePredicate {

    if (isNodeTrait(input))
        return input.is

    if (Node.is(input)) {
        return Comparable.is(input)

            ? other => input[Comparable.equals](other)

            : other => Object.is(input, other)
    }

    if (isFunc(input))
        return input

    throw new Error('Invalid find input.')
} 

function toNodeName(input: FindInput): string {

    let name = 'name' in input 
        ? input.name 
        : ''

    // assume typeguard with convention isModuleName
    if (name.startsWith('is'))
        name = name.slice(0, 2)

    // assume anonymous typeguard
    if (!name)
        return Node.name

    return name
}

//// Exports ////

export default Find

export {

    Find,
    FindFlag,
    FindConstructor, 
    FindInput,
    FindOutput,

    FindNode,
    FindNodes,
    HasNode,
    AssertNode,
}