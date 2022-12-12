import { 
    Func, 
} from '@benzed/util'

import Module from '../module'
import Modules from '../module/modules'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types
*/

//// Helper ////

/**
 * Get the method properties of a type.
 */
type _MethodsOf<M extends Module> = {
    [K in keyof M as M[K] extends Func ? K : never]: M[K]
}

/**
 * Add the key/values of type B if they do not exist on A
 */
type _Fill<A, B> = {
    [K in keyof A | keyof B]: K extends keyof A 
        ? A[K] 
        : K extends keyof B 
            ? B[K] 
            : never
}

//// Definition ////

/**
 * A node's interface is comprised of public methods of it's modules.
 */
export type NodeInterface<M> = M extends [infer Mx, ...infer Mr] 
    ? Mx extends Module 
        ? _Fill<_MethodsOf<Mx>, NodeInterface<Mr>>
        : NodeInterface<Mr>
    : {}

export type Node<M extends readonly Module[]> = Modules<M> & NodeInterface<M>