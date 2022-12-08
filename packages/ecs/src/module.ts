import { Func, nil, TypeGuard } from '@benzed/util'
import type { AnyNode, Node } from './node'

//// Types ////

export type GetModule<M extends Module> = M | TypeGuard<M, Module>

export type FindScope = 'parent' | 'siblings' | 'children'
export type path = `/${string | number}`
export type Modules = Modules[]

export type Extension = object | Func

//// Module ////

export interface Module {

    get root(): AnyNode

    get parent(): AnyNode | nil
    get first(): Module | nil 
    get last(): Module | nil
    get modules(): Module[]

    get prev(): Module | nil
    get next(): Module | nil

    get<M extends Module>(type: GetModule<M>, scope: FindScope, required: true): M | nil    
    get<M extends Module>(type: GetModule<M>, scope: FindScope, required?: false): M | nil
    get<M extends Module>(scope: FindScope, required: true): M | nil
    get<M extends Module>(scope: FindScope, required?: false): M | nil
    get<N extends AnyNode>(path: Path, required?: false): N | nil 
    get<N extends AnyNode>(path: Path, required: true): N 

    find<M extends Module>(type: GetModule<M>, scope: FindScope): M[]
    find<M extends Module>(type: GetModule<M>): M[]

}

/**
 * Path
 */
export interface Path<P extends path> extends Module {

    path: P

}

