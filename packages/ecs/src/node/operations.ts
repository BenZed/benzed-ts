
import { copy } from '@benzed/immutable'
import { 
    Empty,
    KeysOf, 
    Mutable, 
} from '@benzed/util'

import type { Node, Nodes } from './node'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

//// Helper Methods ////

type _NestedPathsOf<
    N extends Nodes,
    P extends string = KeysOf<N>
> = P extends KeysOf<N> 
    ? N[P]['nodes'] extends Empty
        ? P
        : P | `${P}/${_NestedPathsOf<N[P]['nodes']>}`
    : never 

type _GetNodeAtNestedPath<N extends Nodes, P extends string> = P extends `${infer Px}/${infer Pxr}`
    ? N[Px] extends { nodes: Nodes }
        ? _GetNodeAtNestedPath<N[Px]['nodes'], Pxr>
        : N[Px]
    : N[P]

//// Path Methods ////

export type PathsOf<N extends Nodes> = KeysOf<N>

export type NestedPathsOf<N extends Nodes> = _NestedPathsOf<N>

export type GetNodeAtPath<N extends Nodes, P extends NestedPathsOf<N>> = 
    _GetNodeAtNestedPath<N, P>

//// SetNode  ////
    
export type SetNode<N extends Nodes, K extends string, Nx extends Node> = {
    [Nk in K | PathsOf<N>]: Nk extends K ? Nx : N[Nk]
} extends infer Nxx ? Nxx extends Nodes ? Nxx : never : never
    
export function setNode<N extends Nodes, K extends string, Nx extends Node>(
    nodes: N, 
    key: K, 
    node: Nx
): SetNode<N, K, Nx>

export function setNode<N extends Nodes, K extends PathsOf<N>, F extends (input: N[K]) => Node>(
    nodes: N, 
    key: K, 
    update: F
): SetNode<N, K, ReturnType<F>>

export function setNode(nodes: Nodes, key: string, nodeOrUpdate: Node | ((current: Node) => Node)): Nodes {
    return _setNodeAtPath(nodes, key, nodeOrUpdate)
}

/**
 * Escape hatch for setting nodes at nested paths, providing the ability to create new nodes on intermediate
 * paths that may be empty.
 * @internal
 */
export function _setNodeAtPath(nodes: Nodes, key: string, nodeOrUpdate: Node | ((current: Node) => Node), emptyPathTemplate?: Node): Nodes {

    const paths = key.split('/').reverse()

    if (paths.length > 1 && !emptyPathTemplate)
        throw new Error(`Cannot set at nested path: ${key}`)
    
    const newNodes = copy(nodes)
    let currNodes = newNodes as Mutable<Nodes>
    
    while (paths.length > 0) {
        const path = paths.pop() as string
        if (path.length === 0)
            throw new Error('key must not be empty')

        if (!currNodes[path])
            currNodes[path] = copy(emptyPathTemplate as Node)

        const isLastPath = paths.length === 0
        if (isLastPath) {
            currNodes[path] = 'parent' in nodeOrUpdate 
                ? nodeOrUpdate 
                : nodeOrUpdate(currNodes[path])
        } else 
            currNodes = currNodes[path].nodes
    }
    
    return newNodes
}

//// RemoveNode ////

export type RemoveNode<N extends Nodes, K extends PathsOf<N>> = {
    [Nk in KeysOf<N> as Nk extends K ? never : Nk]: N[Nk]
} extends infer Nxx ? Nxx extends Nodes ? Nxx : never : never 

export function removeNode<N extends Nodes, K extends PathsOf<N>>(nodes: N, key: K): RemoveNode<N, K>
export function removeNode(nodes: Nodes, key: string): Nodes {
    const newNodes = copy(nodes)
    delete (newNodes as Mutable<Nodes>)[key]
    return newNodes
}