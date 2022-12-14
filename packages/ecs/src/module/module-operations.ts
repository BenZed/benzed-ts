import { copy } from '@benzed/immutable'
import { Indexes, IndexesOf, swap } from '@benzed/util'
import Module, { ModuleArray } from './module'

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
        ...unparent(inputA),
        ...unparent(inputB)
    ]
}

//// SwapModules ////

type _SwapOne<T extends ModuleArray, A extends number, B extends number, I> = I extends A 
    ? T[B]
    : I extends B 
        ? T[A]
        : I extends number 
            ? T[I]
            : never

// TODO this could probably be moved to util or array
type _Swap<T extends ModuleArray, A extends number, B extends number, I extends readonly number[] = Indexes<T>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ _SwapOne<T,A,B,Ix>, ..._Swap<T, A, B, Ir> ]
            : [ _SwapOne<T,A,B,Ix> ]
        : []

export type SwapModules<
    M extends ModuleArray,
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
> = _Swap<M,A,B> extends infer M 
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

    const output = unparent(input) as ModuleArray
    swap(output, indexA as number, indexB)

    return output as SwapModules<M,A,B>
}

//// RemoveModule ////

type _SpliceOneAt<M extends ModuleArray, R extends IndexesOf<M>, Mx, I> = 
    I extends number  
        ? I extends R 
            ? unknown extends Mx
                ? []
                : [Mx]
            : [M[I]]
        : []

type _SpliceOne<M extends ModuleArray, R extends IndexesOf<M>, Mx, I extends readonly number[] = Indexes<M>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ ..._SpliceOneAt<M, R, Mx, Ix>, ..._SpliceOne<M, R, Mx, Ir> ]
            : [ ..._SpliceOneAt<M, R, Mx, Ix> ]
        : []

export type RemoveModule<
    M extends ModuleArray,
    I extends IndexesOf<M>
> = _SpliceOne<M, I, unknown> extends infer M 
    ? M extends ModuleArray
        ? M
        : never 
    : never

export function removeModule<
    M extends ModuleArray,
    I extends IndexesOf<M>
>(
    input: M,
    index: I
): RemoveModule<M, I> {

    const output = unparent(input) as ModuleArray
    (output as Module[]).splice(index, 1)

    return output as RemoveModule<M, I>
}

//// SetModule ////

export type SetModule<M extends ModuleArray, Mx,I extends IndexesOf<M>>   
    = _SpliceOne<M, I, Mx>

export function setModule<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    F extends (input: M[I]) => Module, 
>(input: M, index: I, createModule: F): SetModule<M, ReturnType<F>, I>

export function setModule<
    M extends ModuleArray,
    I extends IndexesOf<M>,
    Mx extends Module,
>(
    input: M,
    index: I,
    module: Mx
): SetModule<M, Mx, I> 

export function setModule(input: ModuleArray, index: number, module: Module | ((current: Module) => Module)): ModuleArray {

    module = 'parent' in module ? module : module(input[index])

    const [newModule] = unparent([module]) 

    const output = unparent(input) as ModuleArray
    (output as Module[]).splice(index, 1, newModule)

    return output
}

//// Helper ////

export function unparent<M extends ModuleArray>(modules: M): M {
    return modules.some(m => m.parent)
        ? modules.map(m => m.parent ? copy(m) : m) as ModuleArray as M
        : modules
}

