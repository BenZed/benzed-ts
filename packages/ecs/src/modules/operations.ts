
import { 
    Indexes, 
    IndexesOf, 
    swap

} from '@benzed/util'

import Module, { ModuleArray } from '../module'

//// SpliceModules ////

type _SpliceModule<M extends ModuleArray, Mi extends IndexesOf<M>, Mx, I> = 
    I extends number  
        ? I extends Mi 
            ? Mx extends ModuleArray // insert
                ? [...Mx, M[I]] 
                : Mx extends Module /// overwrite
                    ? [Mx]
                    : [] //          // delete
            : [M[I]]
        : []

type _SpliceModules<M extends ModuleArray, I extends IndexesOf<M>, T, _I extends readonly number[] = Indexes<M>> = 
    _I extends [infer _Ix, ...infer _Ir]
        ? _Ir extends readonly number[]
            ? [ ..._SpliceModule<M, I, T, _Ix>, ..._SpliceModules<M, I, T, _Ir> ]
            : [ ..._SpliceModule<M, I, T, _Ix> ]
        : []

type SpliceModules<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    T, // ModuleArray to add, Module to overwrite 1, unknown to delete 1
> = _SpliceModules<M, I, T> extends infer Mx
    ? Mx extends ModuleArray
        ? Mx
        : []
    : []

function spliceModule(input: ModuleArray, index: number, deleteCount: number, ...insert: Module[]): ModuleArray {
    const output = [...input]
    
    output.splice(index, deleteCount, ...insert)

    return output
}

//// AddModules ////
    
export type AddModules<
    A extends ModuleArray, 
    B extends ModuleArray
> = [
    ...A,
    ...B
] 

export function addModules<
    A extends ModuleArray,
    B extends ModuleArray,
>(
    inputA: A,
    inputB: B
): AddModules<A,B> {
    return [
        ...inputA,
        ...inputB
    ]
}

//// InsertModules ////

export type InsertModule<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    Mx extends ModuleArray
> = SpliceModules<M, I, Mx>

export function insertModules<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    Mx extends ModuleArray 
>(
    input: M,
    index: I,
    ...modules: Mx
): InsertModule<M, I, Mx> {
    return spliceModule(input, index, 0, ...modules) as InsertModule<M,I,Mx>
}

//// SwapModules ////

type _SwapModule<T extends ModuleArray, A extends number, B extends number, I> = I extends A 
    ? T[B]
    : I extends B 
        ? T[A]
        : I extends number 
            ? T[I]
            : never

type _SwapModules<T extends ModuleArray, A extends number, B extends number, I extends readonly number[] = Indexes<T>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ _SwapModule<T, A, B, Ix>, ..._SwapModules<T, A, B, Ir> ]
            : [ _SwapModule<T, A, B, Ix> ]
        : []

export type SwapModules<
    M extends ModuleArray,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
> = _SwapModules<M,A,B> extends infer M 
    ? M extends ModuleArray
        ? M
        : []
    : []

export function swapModules<
    M extends ModuleArray,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
>(
    input: M,
    indexA: A,
    indexB: B
): SwapModules<M,A,B> {

    const output = [...input] as ModuleArray
    swap(output, indexA as number, indexB)

    return output as SwapModules<M,A,B>
}

//// RemoveModule ////

export type RemoveModule<
    M extends ModuleArray,
    I extends IndexesOf<M>
> = SpliceModules<M, I, unknown>

export function removeModule<
    M extends ModuleArray,
    I extends IndexesOf<M>
>(
    input: M,
    index: I
): RemoveModule<M, I> {
    return spliceModule(input, index, 1) as RemoveModule<M, I>
}

//// SetModule ////

export type SetModule<M extends ModuleArray, I extends IndexesOf<M>, Mx>   
    = SpliceModules<M, I, Mx>

export function setModule<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    F extends (input: M[I]) => Module
>(input: M, index: I, initializer: F): SetModule<M, I, ReturnType<F>>

export function setModule<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    Mx extends Module,
>(
    input: M,
    index: I,
    module: Mx
): SetModule<M, I, Mx> 

export function setModule(input: ModuleArray, index: number, moduleOrInitializer: Module | ((current: Module) => Module)): ModuleArray {

    const newModule = 'parent' in moduleOrInitializer 
        ? moduleOrInitializer 
        : moduleOrInitializer(input[index])

    return spliceModule(input, index, 1, newModule) 

}

//// GetModule ////

export type GetModule<M extends ModuleArray, I extends IndexesOf<M>> = M[I]

export function getModule<M extends ModuleArray, I extends IndexesOf<M>>(modules: M, index: I): Module {
    const module = modules.at(index)
    if (!module)
        throw new Error(`Invalid index: ${index}`)

    return module
}

