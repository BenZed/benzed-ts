import { Func } from './func'
import { Merge } from './merge'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

export type Json =
    null | string | number | boolean |
    Json[] |
    { [k: string]: Json }

/**
 * Make specific keys of a type required
 */
export type PartialRequire<T, K extends keyof T> =
    Merge<[
        {
            [Tk in keyof T as Tk extends K ? Tk : never]-?: T[Tk]
        },
        {
            [Tk in keyof T as Tk extends K ? never : Tk]: T[Tk]
        }
    ]>

/**
 * Make specific keys of a type optional.
 */
export type PartialOptional<T, K extends keyof T> =
    Merge<[
        {
            [Tk in keyof T as Tk extends K ? never : Tk]: T[Tk]
        },
        {
            [Tk in keyof T as Tk extends K ? Tk : never]?: T[Tk]
        }
    ]>

/**
 * Get a compiled contract of a type.
 */
export type Compile<T, E = void, R extends boolean = true> = 
    T extends E 
        ? T

        : T extends Map<infer K, infer V>
            ? R extends true 
                ? Map<Compile<K, E, R>, Compile<V, E, R>>
                : Map<K,V>

            : T extends Set<infer V> 
                ? Set<V>

                : T extends Promise<infer A> 
                    ? R extends true 
                        ? Promise<Compile<A, E, R>>
                        : Promise<A>

                    : T extends object 

                        ? T extends Date | RegExp | Func | Error

                            ? T

                            : T extends infer O 

                                ? { [K in keyof O]: R extends true 
                                    ? Compile<O[K], E, R> 
                                    : O[K] 
                                } 
                                : never

                        : T 

/**
 * Retreive conditional types if two input types are equal.
 */
export type IfEquals<T1, T2, Y, N = never> =
    // This is some magician shit I got off the internet and did not write.
    (<T>() => T extends T1 ? 1 : 2) extends
    (<T>() => T extends T2 ? 1 : 2) ? Y : N

/**
 * Get the string keys of a type.
 */
export type StringKeys<T> = Extract<keyof T, string>

/**
 * Convert a type to a numeric
 */
export type ToNumber<N, Vf extends number = 0 /* (V)alue to use if conversion (f)ails*/> = 
 N extends number ? N 
     : N extends `${infer N extends number}` ? N
         : N extends bigint ? ToNumber<`${N}`, Vf>
             : N extends boolean ? N extends true ? 1 : 0
                 : Vf

/*
 * Get a union of indexes of a tuple type
 */
export type IndexesOf<A extends unknown[] | readonly unknown[]> = keyof {
    [K in keyof A as ToNumber<K>]: never
}

//// Invalid Type Error ////

export interface Stack<T> extends Iterable<T> {

    [index: number]: T

    push: Array<T>['push']
    
    pop: Array<T>['pop']
    
}

export type Infer<T> = T extends infer I ? I : never