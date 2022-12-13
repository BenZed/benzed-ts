import { copy } from '@benzed/immutable'
import { Indexes, IndexesOf, swap } from '@benzed/util'
import Module from './module'

//// AddModules ////
    
export type AddModules<
    A extends readonly Module[], 
    B extends readonly Module[]
> = [
    ...A,
    ...B
] 

export function addModules<
    A extends readonly Module<any>[],
    B extends readonly Module<any>[],
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

type _SwapOne<T extends readonly Module[], A extends number, B extends number, I> = I extends A 
    ? T[B]
    : I extends B 
        ? T[A]
        : I extends number 
            ? T[I]
            : never

// TODO this could probably be moved to util or array
type _Swap<T extends readonly Module[], A extends number, B extends number, I extends readonly number[] = Indexes<T>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ _SwapOne<T,A,B,Ix>, ..._Swap<T, A, B, Ir> ]
            : [ _SwapOne<T,A,B,Ix> ]
        : []

export type SwapModules<
    M extends readonly Module[],
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
> = _Swap<M,A,B> extends infer M 
    ? M extends readonly Module[]
        ? M
        : []
    : []

export function swapModules<
    M extends readonly Module[],
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
>(
    input: M,
    indexA: A,
    indexB: B
): SwapModules<M,A,B> {

    const output = unparent(input) as readonly Module[]
    swap(output, indexA as number, indexB)

    return output as SwapModules<M,A,B>
}

//// RemoveModule ////

type _SpliceOneAt<M extends readonly Module[], R extends IndexesOf<M>, Mx, I> = 
    I extends number  
        ? I extends R 
            ? unknown extends Mx
                ? []
                : [Mx]
            : [M[I]]
        : []

type _SpliceOne<M extends readonly Module[], R extends IndexesOf<M>, Mx, I extends readonly number[] = Indexes<M>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ ..._SpliceOneAt<M, R, Mx, Ix>, ..._SpliceOne<M, R, Mx, Ir> ]
            : [ ..._SpliceOneAt<M, R, Mx, Ix> ]
        : []

export type RemoveModule<
    M extends readonly Module[],
    I extends IndexesOf<M>
> = _SpliceOne<M, I, unknown> extends infer M 
    ? M extends readonly Module[]
        ? M
        : never 
    : never

export function removeModule<
    M extends readonly Module[],
    I extends IndexesOf<M>
>(
    input: M,
    index: I
): RemoveModule<M, I> {

    const output = unparent(input) as readonly Module[]
    (output as Module[]).splice(index, 1)

    return output as RemoveModule<M, I>
}

//// SetModule ////

export type SetModule<M extends readonly Module[], Mx,I extends IndexesOf<M>>   
    = _SpliceOne<M, I, Mx>

export function setModule<
    M extends readonly Module[],
    Mx extends Module,
    I extends IndexesOf<M>
>(
    input: M,
    module: Mx,
    index: I,
): SetModule<M, Mx, I> {

    const [newModule] = unparent([module]) 

    const output = unparent(input) as readonly Module[]
    (output as Module[]).splice(index, 1, newModule)

    return output as SetModule<M, Mx, I>
}

//// Helper ////

function unparent<M extends readonly Module[]>(modules: M): M {
    return modules.some(m => m.parent)
        ? modules.map(m => m.parent ? copy(m) : m) as readonly Module[] as M
        : modules
}

