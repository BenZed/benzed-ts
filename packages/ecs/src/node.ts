import Module, { Modules } from "./module"
import { copy, $$copy } from '@benzed/immutable'
import { StringKeys } from "@benzed/util"

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

/*** Types ***/

type Nodes = { [key: string]: Node }

type AddChild<P extends string, Cx extends Node, N extends Node> = N extends Node<infer M, infer C>
    ? Node<M, {
        [Px in keyof C | P]: Px extends P ? Cx : C[Px]
    }>
    : never

/*** Main ***/

class Node<M extends Modules = any, C extends Nodes = any> {

    static create(): Node<[], {}> {
        return new Node([], {})
    }

    private constructor(
        readonly modules: M,
        readonly _children: C
    ) { 
        for (const module of modules)
            module._setNode(this)
    }

    addModule<Mx extends Module>(
        module: Mx
    ): Node<[...M, Mx], C> {
 
        if (module.node) {
            throw new Error(
                `${module.constructor.name} is already parented, ` + 
                `copy it first.`
            )
        }

        return new Node([ 
            ...copy(this.modules), 
            module
        ], this._children)
    }

    addChild<P extends string, Cx extends Node>(
        path: P, 
        child: Cx
    ): AddChild<P,Cx,this> {

        return new Node(
            copy(this.modules),
            {
                ...copy(this._children),
                [path]: child
            }
        ) as AddChild<P,Cx,this>
    }

    getChild<P extends StringKeys<C>>(path: P): C[P] {
        return this._children[path]
    }

    copy(): Node<M,C> {
        return this[$$copy]()
    }

    [$$copy](): Node<M,C> {
        return new Node(
            copy(this.modules),
            copy(this._children)
        )
    }
}

/*** Export ***/

export default Node

export {
    Node
}