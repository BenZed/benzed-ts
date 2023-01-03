
/**
 * Convert a string literal to a numeric literal.
 */
export type StringToNumber<T> = T extends `${infer N extends number}` ? N : never

type array = unknown[] | readonly unknown[]
 
/**
 * Get a union of indexes in an array type.
 */
export type IndexesOf<A extends array> = {
    [K in keyof A]: StringToNumber<K>
}[number]

export type IndexValue<A extends ArrayLike<unknown>> = 
    A extends ArrayLike<infer V> ? V : unknown

/**
 * Get the first element of an array type
 */
export type First<A extends array> = A extends [infer F, ...unknown[]] | [infer F] ? F : unknown

/**
 * Get the last element of an array type
 */
export type Last<A extends array> = A extends [...unknown[], infer L] | [infer L] ? L : unknown
