/* eslint-disable @typescript-eslint/no-explicit-any */

export type Func<A extends any[] = unknown[], V = unknown> = (...args: A) => V

export type Json =
    null | string | number | boolean |
    Json[] |
    { [prop: string]: Json }

export type RequirePartial<T, K extends keyof T> =
    {
        [TK in keyof T as TK extends K ? TK : never]-?: T[TK]
    } & {
        [TK in keyof T as TK extends K ? never : TK]: T[TK]
    }

export type UndefinedToOptional<T> =
    {
        [K in keyof T as undefined extends T[K] ? never : K]-?: T[K]
    } &
    {
        [K in keyof T as undefined extends T[K] ? K : never]?: T[K]
    }

export type TypeMatchedKeys<T1, K1 extends keyof T1, T2> = {
    [K2 in keyof T2]: T2[K2] extends T1[K1] ? K2 : never
}[keyof T2]