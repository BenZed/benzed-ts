
/**
 * Create an interesection out of an arbitrary number of types
 */
export type Intersect<T extends readonly object[]> = T extends [infer F, ...infer R]
    ? R extends readonly object[] 
        ? F & Intersect<R>
        : F
    : unknown

/**
 * Combine a number of objects.
 */
export const intersect: <A extends readonly object[]> (...objects: A) => Intersect<A> = Object.assign

/**
 * Merge an arbitrary number of types into one. 
 */
export type Merge<T extends readonly object[]> = Intersect<T> extends infer O ? O : never

/**
 * Merge an arbitrary number of objects into one.
 */
export const merge: <A extends readonly object[]> (...objects: A) => Merge<A> = Object.assign