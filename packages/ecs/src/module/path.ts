import $, { SchemaFor } from '@benzed/schema'

import { KeysOf } from '@benzed/util'

import type { Modules } from './module'
import type { Node, Nodes } from '../node'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
*/
//// Helper Types ////

type _PathOf<M extends Modules> = M extends [infer Mx, ...infer Mr]
    ? Mx extends Path<infer P> 
        ? P
        : Mr extends Modules
            ? _PathOf<Mr>
            : unknown
    : unknown

type _NodeAtPath<N, P extends string, R extends boolean> = N extends Node<infer Mx, Nodes> 
    ? _PathOf<Mx> extends path 
        ? { [K in `${P}${_PathOf<Mx>}`]: N } & 
        (R extends true ? _NodesAtPath<Mx, `${P}${_PathOf<Mx>}`, true> : {})
        
        : {}
    : {}

type _NodesAtPath<M, P extends string, R extends boolean> = M extends [infer Sx, ...infer Sr] 
    ? Sr extends Modules
        ? _NodeAtPath<Sx, P, R> & _NodesAtPath<Sr, P, R>
        : _NodeAtPath<Sx, P, R>
    : {}

//// Path Type ////
    
type path = `/${string}`

//// Path Inference Types ////

type NestedPathsOf<M extends Modules> = KeysOf<_NodesAtPath<M, '', true>>

type ToPath<P extends string> = P extends path ? P : `/${P}`

type PathsOf<M extends Modules> = KeysOf<_NodesAtPath<M, '', false>>

type GetNodeAtNestedPath<M extends Modules, P extends NestedPathsOf<M>> = _NodesAtPath<M, '', true>[P]

type GetNodeAtPath<M extends Modules, P extends PathsOf<M>> = _NodesAtPath<M, '', false>[P]

//// Main ////

const $path = $.string
    .trim()
    .validates(
        s => s.startsWith('/') ? s : `/${s}`, 
        'Must start with a "/"'
    )
    .validates(
        s => s.replace(/\/+/g, '/'), 
        'Must not have multiple consecutive "/"s'
    ) 
    .validates(
        s => s.replace(/\/$/, '') || '/',
        //                                                      ^ in case we just removed the last slash
        'Must not end with a "/"'
    ) as SchemaFor<path>

//// Exports ////

export default $path

export {
    path,
    $path,
    PathsOf,
    ToPath,
    NestedPathsOf,
    GetNodeAtPath,
    GetNodeAtNestedPath
}