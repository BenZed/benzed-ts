import { Infer } from './types'

/**
 * Add properties from B that do not exist on A
 */
export type Append<A,B> = Infer<{
    [K in keyof A | keyof B]: K extends keyof A
        ? A[K]
        : K extends keyof B 
            ? B[K]
            : never
}>

/**
 * Define all properties on B that do not exist with defined values on A
 */
export const append = <A extends object, B extends object>(a: A, b: B): Append<A,B> => {

    const keys = [
        ...Object.getOwnPropertyNames(b),
        ...Object.getOwnPropertySymbols(b)
    ]
    for (const key of keys) {

        if (key in a)
            continue
        
        const descriptor = Object.getOwnPropertyDescriptor(b, key)
        if (descriptor)
            Object.defineProperty(a, key, descriptor)
    }

    return a as Append<A,B>
}

/**
 * Create an interesection out of an arbitrary number of types
 */
export type Intersect<T extends unknown[] | readonly unknown[]> = T extends [infer T1, ...infer Tr]
    ? T1 & Intersect<Tr>
    : unknown

/**
 * Combine a number of objects.
 */
export const intersect = <A extends readonly object[]> (...objects: A): Intersect<A> => {

    const [target, ...sources] = objects
    for (const source of sources) {
        const descriptors = Object.getOwnPropertyDescriptors(source)
        Object.defineProperties(target, descriptors)
    }

    return target as Intersect<A>
}

type Combine<T> = T extends infer O 
    ? {
        [K in keyof O]: O[K]
    }
    : T

/**
 * Merge an arbitrary number of types into one. 
 */
export type Merge<T extends readonly object[]> =
    Intersect<T> extends (...args: infer A) => infer R 
        ? ((...args: A) => R) & Combine<Intersect<T>>
        : Combine<Intersect<T>>

/**
 * Merge an arbitrary number of objects into one.
 */
export const merge: <A extends readonly object[]> (...objects: A) => Merge<A> = Object.assign

export {
    merge as assign
}