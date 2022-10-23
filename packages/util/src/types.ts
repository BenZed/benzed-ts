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
export type Intersect<T> = T extends [infer FIRST, ...infer REST]
    ? FIRST & Intersect<REST>
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
export type Compile<TYPE, EXCEPTIONS = void, RECURSIVE extends boolean = true> = 
    TYPE extends EXCEPTIONS 
        ? TYPE

        : TYPE extends Map<infer K, infer V>
            ? RECURSIVE extends true 
                ? Map<Compile<K, EXCEPTIONS, RECURSIVE>, Compile<V, EXCEPTIONS, RECURSIVE>>
                : Map<K,V>

            : TYPE extends Set<infer V> 
                ? Set<V>

                : TYPE extends Promise<infer A> 
                    ? RECURSIVE extends true 
                        ? Promise<Compile<A, EXCEPTIONS, RECURSIVE>>
                        : Promise<A>

                    : TYPE extends object 

                        ? TYPE extends Date | RegExp | Func<any,any,any> | Error

                            ? TYPE

                            : TYPE extends infer O 

                                ? { [K in keyof O]: RECURSIVE extends true 
                                    ? Compile<O[K], EXCEPTIONS, RECURSIVE> 
                                    : O[K] 
                                } 
                                : never

                        : TYPE 

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
