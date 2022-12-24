import { callable, isFunc, isNil, nil, TypeGuard } from '@benzed/util'
import { $$equals } from '@benzed/immutable'

import Node, { $$isNodeConstructor } from '../node'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Helper ////

type NodeConstructor = (new (...args: any[]) => Node) | (abstract new (...args: any[]) => Node)
type NodeInstance<C extends NodeConstructor> = InstanceType<C>
type NodeTypeGuard = TypeGuard<Node, Node>
type NodePredicate = (input: Node) => Node | nil

export type FindInput = Node | NodePredicate | NodeTypeGuard | NodeConstructor
export type FindOutput<F> = F extends (input: Node) => infer Mx 
    ? F extends TypeGuard<infer M , Node>   
        ? M 
        : Exclude<Mx, nil> 
    : F extends NodeConstructor
        ? NodeInstance<F>
        : F extends Node 
            ? F
            : Node<F>

//// FindModule ////

export interface FindNode {

    get require(): AssertNode

    <I extends FindInput>(state: I): FindOutput<I> | nil
    descendent<I extends FindInput>(state: I): FindOutput<I> | nil
    descendents<I extends FindInput>(state: I): FindOutput<I>[]
    child<I extends FindInput>(state: I): FindOutput<I> | nil
    children<I extends FindInput>(state: I): FindOutput<I>[]
    sibling<I extends FindInput>(state: I): FindOutput<I> | nil
    siblings<I extends FindInput>(state: I): FindOutput<I>[]
    parent<I extends FindInput>(state: I): FindOutput<I> | nil
    parents<I extends FindInput>(state: I): FindOutput<I>[]
    ancestor<I extends FindInput>(state: I): FindOutput<I> | nil
    ancestors<I extends FindInput>(state: I): FindOutput<I>[]
}

export interface HasNode {
    <I extends FindInput>(state: I): boolean
    descendent<I extends FindInput>(state: I): boolean
    children<I extends FindInput>(state: I): boolean
    sibling<I extends FindInput>(state: I): boolean
    parent<I extends FindInput>(state: I): boolean
    ancestor<I extends FindInput>(state: I): boolean
}

//// AssertNode ////

export interface AssertNode {
    <I extends FindInput>(state: I): FindOutput<I>
    descendent<I extends FindInput>(state: I): FindOutput<I>
    child<I extends FindInput>(state: I): FindOutput<I> 
    sibling<I extends FindInput>(state: I): FindOutput<I> 
    parent<I extends FindInput>(state: I): FindOutput<I>
    ancestor<I extends FindInput>(state: I): FindOutput<I>
}

//// Implementation ////

export enum FindFlag {
    Require,
    Has
}

interface FindConstructor {
    new (node: Node, flag: FindFlag.Require, error?: string): AssertNode
    new (node: Node, flag: FindFlag.Has, error?: string): HasNode
    new (node: Node): FindNode
}

const _Finder = callable(

    function find(input: FindInput) {
        return this.node.hasChildren
            ? this.children(input)
            : this.siblings(input)
    },

    class {

        constructor(
            readonly node: Node,
            private readonly _flag?: FindFlag,
            private readonly _error?: string
        ) { }

        get require(): FindNode {
            this._assertNoFlag()
            return new _Finder(
                this.node, 
                FindFlag.Require, 
                this._error
            ) as FindNode
        }

        descendents = (input: FindInput): unknown => this._find(
            this.node.eachDescendent(),
            input,
            true
        )

        descendent = (input: FindInput): unknown => this._find(
            this.node.eachDescendent(),
            input,
            false
        )

        children = (input: FindInput): unknown => this._find(
            this.node.eachChild(),
            input,
            true
        )

        child = (input: FindInput): unknown => this._find(
            this.node.eachChild(),
            input,
            false
        )

        siblings = (input: FindInput): unknown => this._find(
            this.node.eachSibling(),
            input,
            true
        )

        sibling = (input: FindInput): unknown => this._find(
            this.node.eachSibling(),
            input,
            false
        )

        parents = (input: FindInput): unknown => this._find(
            this.node.eachParent(),
            input,
            true
        )

        parent = (input: FindInput): unknown => this._find(
            this.node.eachParent(),
            input,
            false
        )

        ancestors = (input: FindInput): unknown => this._find(
            this.node.eachAncestor(),
            input,
            true
        )

        ancestor = (input: FindInput): unknown => this._find(
            this.node.eachAncestor(),
            input,
            false
        )

        //// Helper ////

        private _find(iterator: IterableIterator<Node>, input: FindInput, many: boolean): unknown {
            const predicate = toNodePredicate(input)

            const output: Node[] = []
            const { _flag: flag } = this

            for (const module of iterator) {
                const pass = predicate(module)
                if (pass)
                    output.push(pass instanceof Node ? pass : module)
                if (pass && !many)
                    break
            }

            const has = output.length > 0
            if (flag === FindFlag.Require && !has)
                throw new Error(this._error ?? `Could not find module ${toNodeName(input)}`)

            if (flag === FindFlag.Has)
                return has

            return many ? output : output.at(0)
        }

        private _assertNoFlag(): void {
            if (!isNil(this._flag) )
                throw new Error(`Find has ${FindFlag[this._flag]}`)
        }

    }, 
    'Finder'
)

export const Finder = _Finder as unknown as FindConstructor

//// Helper ////

function isNodeConstructor(input: FindInput): input is NodeConstructor {
    return $$isNodeConstructor in input && !!input[$$isNodeConstructor]
}

function toNodePredicate(input: FindInput): NodeTypeGuard | NodePredicate {
        
    if (isNodeConstructor(input)) {
        return (other => callable.isInstance(
            other, 
            input as new () => Node
        )) as NodeTypeGuard
    }

    if (callable.isInstance(input, Node)) 
        return (other => input[$$equals](other)) as NodeTypeGuard

    if (isFunc(input))
        return input
        
    throw new Error('Invalid find input')
} 

function toNodeName({ name }: FindInput): string {
   
    // assume typeguard with convention isModuleName
    if (name.startsWith('is'))
        name = name.slice(0, 2)

    // assume anonymous typeguard
    if (!name)
        return Node.name

    return name
}

