
import { nil } from '@benzed/util'
import { Trait } from '@benzed/traits'

import {
    $$parent,
    getParent,
    isNode, 
    setParent,
} from './parent'

import {
    eachAncestor,
    eachChild,
    eachDescendent,
    eachNode,
    eachParent,
    eachSibling,
    getChildren,
    getRoot 
} from './relations'

import { getPath } from './path'

import { Find, AssertNode, FindFlag, FindNode, HasNode } from './find'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// Main ////

/**
 * The node trait creates knowledge of relations between objects,
 * allowing them to make assertions based on their relationship structure,
 * or existence of other nodes in their relationship tree.
 * 
 * A node will automatically assign itself as the parent of any
 * properties that are defined in it that are also nodes.
 */
abstract class Node extends Trait {

    static readonly parent: typeof $$parent = $$parent

    static override readonly is = isNode

    static readonly setParent = setParent

    static readonly getParent = getParent
    static readonly getChildren = getChildren
    static readonly getRoot = getRoot

    static readonly eachChild = eachChild
    static readonly eachParent = eachParent
    static readonly eachSibling = eachSibling
    static readonly eachAncestor = eachAncestor
    static readonly eachDescendent = eachDescendent
    static readonly eachNode = eachNode

    static readonly getPath = getPath

    static find<N extends Node>(node: N): FindNode<N> {
        return new Find(node)
    }

    static has<N extends Node>(node: N): HasNode<N> {
        return new Find(node, FindFlag.Has)
    }

    static assert<N extends Node>(node: N): AssertNode<N> {
        return new Find(node, FindFlag.Assert)
    }

    static [Trait.onApply](node: Node): Node {

        const proxyNode = new Proxy(node, {
            defineProperty(node, key, descriptor) {

                const { value } = descriptor

                const isParentKey = key === $$parent

                // clear parent of node being over-written
                if (!isParentKey && isNode((node as any)[key]))
                    setParent((node as any)[key], nil)

                // set parent of new node
                if (!isParentKey && isNode(value)) 
                    setParent(value, proxyNode)

                return Reflect.defineProperty(node, key, descriptor)
            },

            set(node, key, value, proxy) {
                return Reflect.set(node, key, value, proxy)
            }
        })

        setParent(proxyNode, nil)
        return proxyNode
    }

    readonly [$$parent]: Node | nil

}

//// Exports ////

export default Node

export {
    Node
}