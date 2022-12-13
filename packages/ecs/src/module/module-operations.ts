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
    A extends readonly Module[],
    B extends readonly Module[],
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
type _SwapMany<T extends readonly Module[], A extends number, B extends number, I extends readonly number[] = Indexes<T>> = 
    I extends [infer Ix, ...infer Ir]
        ? Ir extends readonly number[]
            ? [ _SwapOne<T,A,B,Ix>, ..._SwapMany<T, A, B, Ir> ]
            : [ _SwapOne<T,A,B,Ix> ]
        : []

export type SwapModules<
    M extends readonly Module[],
    A extends IndexesOf<M>,
    B extends IndexesOf<M>
> = _SwapMany<M,A,B> extends infer M 
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

    swap(output, indexA as number, indexB as number)

    return output as SwapModules<M,A,B>
}

//// Helper ////

function unparent<M extends readonly Module[]>(modules: M): M {
    return modules.map(m => m.parent ? copy(m) : m) as readonly Module[] as M
}

