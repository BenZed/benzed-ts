import { Merge } from './merge'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

export type Func = (...args: any[]) => any 

/**
 * Function that takes a single input, returns a single output.
 */
export type Map<I = unknown, O = unknown> = (input: I) => O

/**
 * Input to output
 */
export type IO<I, O> = Map<I,O>

export type TypeGuard<O extends I, I = unknown> = (input: I) => input is O

export type TypeAssertion<O extends I, I = unknown> = (input: I) => asserts input is O

/**
 * Falsy values
 */
export type Falsy = '' | 0 | null | undefined | false

export type Keys<T = object> = (keyof T)[]

/**
 * Primitives
 */
export type Primitive = string | number | boolean | bigint | null | undefined

export type Json =
    null | string | number | boolean |
    Json[] |
    { [k: string]: Json }

/**
 * Reduce two types to only their matching key values.
 */
export type Collapse<L, R> =
    {
        [K in keyof L as

        // Only include key of left if right has the same key and value
        /**/ K extends keyof R ?
            /**/ R[K] extends L[K]
                /**/ ? K
                /**/ : never
            /**/ : never

        ]: L[K]
    }

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
 * Object with no properties
 */
export type Empty = { [key: string]: never }

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

const InvalidTypeError = Symbol('invalid-type-error')
const Type = Symbol('required-target-type')

export type Invalid<msg extends string = 'This is an invalid type.', T = never> = T extends never 
    ? { [InvalidTypeError]: msg }
    : { [InvalidTypeError]: msg, [Type]: T }

export interface Stack<T> extends Iterable<T> {

    [index: number]: T

    push: Array<T>['push']
    
    pop: Array<T>['pop']
    
}