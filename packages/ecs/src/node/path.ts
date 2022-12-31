import type { Empty, KeysOf } from '@benzed/util'

import type { Modules } from '../module'

import type { Node, Nodes } from '../node'
import { SetNode } from './operations'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
*/

export type _NestedPathsOf<
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

type _SetNodeAtNestedPath<N extends Nodes, P extends string, Nx extends Node<Modules, Nodes>> = 
    P extends `${infer Px}/${infer Pxr}`
        ? {
            [K in KeysOf<N> | Px]: Px extends K 
                ? N[Px] extends Node<infer M, infer Nxx> 
                    ? Node<M, _SetNodeAtNestedPath<Nxx, Pxr, Nx>>
                    : Node<[], _SetNodeAtNestedPath<{}, Pxr, Nx>>
                : N[K]
        }
        : SetNode<N, P, Nx>

//// Path Inference Types ////

type PathsOf<N extends Nodes> = KeysOf<N>
type GetNodeAtPath<N extends Nodes, P extends PathsOf<N>> = N[P]

type NestedPathsOf<N extends Nodes> = _NestedPathsOf<N>
type GetNodeAtNestedPath<N extends Nodes, P extends NestedPathsOf<N>> = 
    _GetNodeAtNestedPath<N, P>

type SetNodeAtNestedPath<N extends Nodes, P extends string, Nx extends Node<Modules, Nodes>> = 
    _SetNodeAtNestedPath<N, P, Nx>

//// Exports ////

export {
    PathsOf,
    NestedPathsOf,
    GetNodeAtPath,
    GetNodeAtNestedPath,
    SetNodeAtNestedPath
}