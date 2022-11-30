
/**
 * Create an interesection out of an arbitrary number of types
 */
export type Intersect<T extends unknown[] | readonly unknown[]> = T extends [infer F, ...infer R]
    ? F & Intersect<R>
    : unknown

/**
 * Combine a number of objects.
 */
export const intersect: <A extends readonly object[]> (...objects: A) => Intersect<A> = Object.assign

type Combine<T> = T extends infer O 
    ? {
        [K in keyof O]: O[K]
    } 
    : T

/**
 * Merge an arbitrary number of types into one. 
 */
export type Merge<T extends readonly object[]> = Intersect<T> extends (...args: infer A) => infer R 
    ? ((...args: A) => R) & Combine<Intersect<T>>
    : Combine<Intersect<T>>

/**
 * Merge an arbitrary number of objects into one.
 */
export const merge: <A extends readonly object[]> (...objects: A) => Merge<A> = Object.assign