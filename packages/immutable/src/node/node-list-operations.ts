import { 
    Indexes, 
    IndexesOf, 
    swap
} from '@benzed/util'

import { isModule, Module } from '../module'

import { copy } from '../copy'

/* eslint-disable 
    @typescript-eslint/no-this-alias,
    @typescript-eslint/ban-types
*/

/**
 * A series of operations for making edits to a static array of modules
 */

//// Types ////

export type Modules = readonly Module[]

//// Splice Modules ////

type _SpliceModule<M extends Modules, Mi extends IndexesOf<M>, Mx, I> = 
    I extends number  
        ? I extends Mi 
            ? Mx extends Modules // insert
                ? [...Mx, M[I]] 
                : Mx extends Module /// overwrite
                    ? [Mx]
                    : [] //          // delete
            : [M[I]]
        : []

type _SpliceModules<M extends Modules, I extends IndexesOf<M>, T, _I extends readonly number[] = Indexes<M>> = 
    _I extends [infer _Ix, ...infer _Ir]
        ? _Ir extends readonly number[]
            ? [ ..._SpliceModule<M, I, T, _Ix>, ..._SpliceModules<M, I, T, _Ir> ]
            : [ ..._SpliceModule<M, I, T, _Ix> ]
        : []

type SpliceModules<
    M extends Modules,
    I extends IndexesOf<M>,
    T, // ModuleArray to add, Module to overwrite 1, unknown to delete 1
> = _SpliceModules<M, I, T> extends infer Mx
    ? Mx extends Modules
        ? Mx
        : []
    : []

function spliceModules(input: Modules, index: number, deleteCount: number, ...insert: Module[]): Modules {
    const output = copy(input) as Module[]
    
    output.splice(index, deleteCount, ...insert)

    return output
}

//// AddModules ////
    
export type AddModules<
    A extends Modules, 
    B extends Modules
> = [
    ...A,
    ...B
] 

export function addModules<
    A extends Modules,
    B extends Modules,
>(
    existing: A,
    ...additional: B
): AddModules<A,B> {
    return [
        ...copy(existing),
        ...additional
    ]
}

//// InsertModules ////

export type InsertModules<
    M extends Modules,
    I extends IndexesOf<M>,
    Mx extends Modules
> = SpliceModules<M, I, Mx>

export function insertModules<
    M extends Modules,
    I extends IndexesOf<M>,
    Mx extends Modules 
>(
    input: M,
    index: I,
    ...modules: Mx
): InsertModules<M, I, Mx> {
    return spliceModules(
        input, 
        index, 0, 
        ...copy(modules)
    ) as InsertModules<M,I,Mx>
}

//// SwapModules ////

type _SwapModule<T extends Modules, A extends number, B extends number, I> = I extends A 
    ? T[B]
    : I extends B 
        ? T[A]
        : I extends number 
            ? T[I]
            : never

type _SwapModules<T extends Modules, A extends number, B extends number, I extends readonly number[] = Indexes<T>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ _SwapModule<T, A, B, Ix>, ..._SwapModules<T, A, B, Ir> ]
            : [ _SwapModule<T, A, B, Ix> ]
        : []

export type SwapModules<
    M extends Modules,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
> = _SwapModules<M,A,B> extends infer M 
    ? M extends Modules
        ? M
        : []
    : []

export function swapModules<
    M extends Modules,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
>(
    input: M,
    indexA: A,
    indexB: B
): SwapModules<M,A,B> {

    const output = copy(input) as Modules
    swap(output, indexA as number, indexB)

    return output as SwapModules<M,A,B>
}

//// RemoveModule ////

export type RemoveModule<
    M extends Modules,
    I extends IndexesOf<M>
> = SpliceModules<M, I, unknown>

export function removeModule<
    M extends Modules,
    I extends IndexesOf<M>
>(
    input: M,
    index: I
): RemoveModule<M, I> {
    return spliceModules(input, index, 1) as RemoveModule<M, I>
}

//// SetModule ////

export type SetModule<M extends Modules, I extends IndexesOf<M>, Mx>   
    = SpliceModules<M, I, Mx>

export function setModule<
    M extends Modules,
    I extends IndexesOf<M>,
    Mx extends Module,
>(
    input: M,
    index: I,
    module: Mx
): SetModule<M, I, Mx> 

export function setModule<
    M extends Modules,
    I extends IndexesOf<M>,
    F extends (input: M[I]) => Module
>(input: M, index: I, update: F): SetModule<M, I, ReturnType<F>>

export function setModule(input: Modules, index: number, update: Module | ((current: Module) => Module)): Modules {

    const newModule = isModule(update)
        ? update 
        : update(input[index])

    return spliceModules(input, index, 1, newModule) 

}
