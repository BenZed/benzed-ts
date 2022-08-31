/* eslint-disable 
    @typescript-eslint/no-explicit-any 
*/

export type Func<A extends any[] = unknown[], V = unknown, T = void> = (this: T, ...args: A) => V

export type Json =
    null | string | number | boolean |
    Json[] |
    { [prop: string]: Json }

/**
 * Reduce two types to only their matching key values.
 */
export type Collapse<LEFT, RIGHT> =
    {
        [K in keyof LEFT as

        // Only include key of left if right has the same key and value
        /**/ K extends keyof RIGHT ?
            /**/ RIGHT[K] extends LEFT[K]
                /**/ ? K
                /**/ : never
            /**/ : never

        ]: LEFT[K]
    }

/**
 * Create an interesection out of an arbitrary number of types
 */
export type Intersect<T extends any[]> = T extends [infer FIRST, ...infer REST]
    ? FIRST & Intersect<REST>
    : unknown

/**
 * Merge an arbitrary number of types into one. 
 */
export type Merge<T extends any[]> =
    {
        [K in keyof Intersect<T>]: Intersect<T>[K]
    }

/**
 * 
 */
export type RequirePartial<T, K extends keyof T> =
    Merge<[
        {
            [TK in keyof T as TK extends K ? TK : never]-?: T[TK]
        },
        {
            [TK in keyof T as TK extends K ? never : TK]: T[TK]
        }
    ]>

/**
 * Get a type where the given values are optional
 */
export type Optional<T, V> =
    Merge<[
        {
            [K in keyof T as V extends T[K] ? never : K]-?: T[K]
        },
        {
            [K in keyof T as V extends T[K] ? K : never]?: T[K]
        }
    ]>

/**
 * Get a type where any undefined property is optional
 */
export type UndefinedToOptional<T> = Optional<T, undefined>

/**
 * Get the string keys of a type.
 */
export type StringKeys<T> = Extract<keyof T, string>