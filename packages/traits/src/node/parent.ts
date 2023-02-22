import { 
    AnyTypeGuard, 
    define, 
    isKeyed, 
    nil
} from '@benzed/util'

import type Node from './node'

//// Symbol ////

export const $$parent = Symbol('parent-node')

//// Helper ////

export const isNode: (child: unknown) => child is Node = 
    isKeyed($$parent) as AnyTypeGuard

/**
 * Set the parent of a node
 */
export function setParent(child: Node, parent: Node | nil): void {
    define.enumerable(
        child,
        $$parent,
        parent
    )
}

/**
 * Get the parent of a node
 */
export function getParent(node: Node): Node | nil {
    return node[$$parent]
}