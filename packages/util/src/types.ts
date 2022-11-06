/* eslint-disable 
    @typescript-eslint/no-explicit-any 
*/

export type Func<A extends any[] = any, V = any, T = void> = (this: T, ...args: A) => V

export type TypeGuard<O extends I, I = unknown> = (input: I) => input is O

export type TypeAssertion<O extends I, I = unknown> = (input: I) => asserts input is O

export type Json =
    null | string | number | boolean |
    Json[] |
    { [prop: string]: Json }

/*** Utility Types ***/

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
 * Create an interesection out of an arbitrary number of types
 */
export type Intersect<T> = T extends [infer F, ...infer R]
    ? F & Intersect<R>
    : unknown

/**
 * Merge an arbitrary number of types into one. 
 */
export type Merge<T> =
    {
        [K in keyof Intersect<T>]: Intersect<T>[K]
    }

/**
 * Remove the optional signature on specific keys of a type.
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
 * Make specific values of a type optional.
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
 * Make undefined values of a type optional.
 */
export type UndefinedToOptional<T> = Optional<T, undefined>

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

                        ? T extends Date | RegExp | Func<any,any,any> | Error

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

export type Split<S extends string, D extends string> =
    string extends S ? string[] :
        S extends '' ? [] :
            S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] :
                [S]

type _SplitOnWordSeparator<T extends string> = Split<T, '-'|'_'|' '>
type _UndefinedToEmptyString<T extends string> = T extends undefined ? '' : T
type _CamelCaseStringArray<K extends string[]> = `${K[0]}${Capitalize<_UndefinedToEmptyString<K[1]>>}`

export type CamelCase<K> = K extends string ? _CamelCaseStringArray<_SplitOnWordSeparator<K>> : K

/**
 * Convert a static string type to a static number type
 */
export type StringToNumber<T> = T extends `${infer N extends number}` ? N : never

/**
 * Get a union of indexes of a tuple type
 */
export type IndexesOf<A extends unknown[] | readonly unknown[]> = keyof {
    [K in keyof A as StringToNumber<K>]: never
}
