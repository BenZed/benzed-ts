
//// Helper ////

/**
 * Fill values of B keys that A does not have
 * ```ts
 * type Foo = Fill<{ foo: string }, { foo: number, bar: number }> // { foo: string, bar: number }
 * ```
 */
export type Fill<A, B> = {
    [K in keyof A | keyof B]: K extends keyof A 
        ? A[K] 
        : K extends keyof B 
            ? B[K] 
            : never
}
