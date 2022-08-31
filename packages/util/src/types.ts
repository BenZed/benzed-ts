/* eslint-disable @typescript-eslint/no-explicit-any */

export type Func<A extends any[] = unknown[], V = unknown, T = void> = (this: T, ...args: A) => V

export type Json =
    null | string | number | boolean |
    Json[] |
    { [prop: string]: Json }

export type TypeMatchedKeys<T1, K1 extends keyof T1, T2> =
    {
        [K2 in keyof T2]: T2[K2] extends T1[K1] ? K2 : never
    }[keyof T2]

/**
 * Create an interesection out of an arbitrary number of types
 */
export type Intersect<T> = T extends [infer FIRST, ...infer REST]
    ? FIRST & Intersect<REST>
    : unknown

/**
 * Merge an arbitrary number of types into one. 
 */
export type Merge<T extends any[]> =
    {
        [K in keyof Intersect<T>]: Intersect<T>[K]
    }

export type RequirePartial<T, K extends keyof T> =
    Merge<[
        {
            [TK in keyof T as TK extends K ? TK : never]-?: T[TK]
        },
        {
            [TK in keyof T as TK extends K ? never : TK]: T[TK]
        }
    ]>

export type Optional<T, V> =
    Merge<[
        {
            [K in keyof T as V extends T[K] ? never : K]-?: T[K]
        },
        {
            [K in keyof T as V extends T[K] ? K : never]?: T[K]
        }
    ]>

export type UndefinedToOptional<T> = Optional<T, undefined>

export type StringKeys<T> = Extract<keyof T, string>