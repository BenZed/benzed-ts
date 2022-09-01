import type { Schema } from './schema'

/* eslint-disable @typescript-eslint/no-explicit-any */

export enum Flags {
    Readonly,
    Optional
}

export type GetFlags<T> = T extends Flags[]
    ? T
    : T extends Schema<any, infer F>
    /**/ ? F
    /**/ : never

export type HasFlag<I, F extends Flags, Y, N = never> =
    GetFlags<I> extends [infer F1, ...infer FN]
    /**/ ? F1 extends F

        /**/ ? Y
        /**/ : FN extends Flags[]

            /**/ ? HasFlag<FN, F, Y, N>
            /**/ : N

    /**/ : N

export type HasReadonly<I, Y, N = never> = HasFlag<I, Flags.Readonly, Y, N>

export type HasOptional<I, Y, N = never> = HasFlag<I, Flags.Optional, Y, N>
