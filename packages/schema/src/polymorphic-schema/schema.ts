
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/indent */

type Intersect<T extends any[]> = T extends [infer T1, ...infer TR] ? T1 & Intersect<TR> : unknown
type Merge<T extends any[]> = { [K in keyof Intersect<T>]: Intersect<T>[K] }

type Shape = { [key: string]: unknown }

enum Flags {
    Readonly,
    Optional
}

type HasFlag<F extends Flags[], T extends Flags, Y, N = never> = F extends [infer T1, ...infer TR]
    ? T1 extends T

    /**/ ? Y
    /**/ : TR extends Flags[]

        /**/ ? HasFlag<TR, T, Y, N>
        /**/ : N

    : N

type IsOptionalReadonly<F extends Flags[], Y, N = never> =
    F extends [Flags.Readonly, Flags.Optional]
    /**/ ? Y
    /**/ : F extends [Flags.Optional, Flags.Readonly]
        /**/ ? Y
        /**/ : N

type IsReadonly<F extends Flags[], Y, N = never> = F extends [Flags.Readonly]
    ? Y
    : N

type IsOptional<F extends Flags[], Y, N = never> = F extends [Flags.Optional]
    ? Y
    : N

type HasReadonly<F extends Flags[], Y, N = never> = HasFlag<F, Flags.Readonly, Y, N>

type HasOptional<F extends Flags[], Y, N = never> = HasFlag<F, Flags.Optional, Y, N>

abstract class Schema<T, F extends Flags[]> {

    public readonly flags: F

    private readonly _default!: T

    public constructor (...flags: F) {
        this.flags = flags
    }

    public abstract readonly optional: HasOptional<
        F,
        never,
        () => Schema<T, [...F, Flags.Optional]>
    >

    public abstract readonly readonly: HasReadonly<
        F,
        never,
        () => Schema<T, [...F, Flags.Readonly]>
    >

}

type SchemaFlags<S> = S extends Schema<any, infer F> ? F : never

type SchemaType<S> = S extends Schema<infer T, any> ? T : never

type Infer<I> = I extends ShapeSchema<infer T, infer F>
    ? ApplyOptional<F, InferShape<T>>

    : I extends Schema<infer T, infer F>
    ? ApplyOptional<F, T>

    : I

type ApplyOptional<F extends Flags[], T> =
    HasOptional<F, T | undefined, T>

type InferShape<T extends Shape> =
    Merge<[
        { readonly [K in keyof T as IsReadonly<SchemaFlags<T[K]>, K>]: Infer<T[K]> },
        { readonly [K in keyof T as IsOptionalReadonly<SchemaFlags<T[K]>, K>]?: Infer<T[K]> },
        { [K in keyof T as IsOptional<SchemaFlags<T[K]>, K>]?: Infer<T[K]> },
        { [K in keyof T as SchemaFlags<T[K]> extends [] ? K : never]: Infer<T[K]> }
    ]>

class ShapeSchema<T extends Shape, F extends Flags[]> extends Schema<T, F> {
    public readonly optional!: HasOptional<
        F,
        never,
        () => ShapeSchema<T, [...F, Flags.Optional]>
    >
    public readonly readonly!: HasReadonly<
        F,
        never,
        () => ShapeSchema<T, [...F, Flags.Readonly]>
    >
}

class NumberSchema<F extends Flags[]> extends Schema<number, F> {
    public readonly optional!: HasOptional<
        F,
        never,
        () => NumberSchema<[...F, Flags.Optional]>
    >
    public readonly readonly!: HasReadonly<
        F,
        never,
        () => NumberSchema<[...F, Flags.Readonly]>
    >
}

class StringSchema<F extends Flags[]> extends Schema<string, F> {
    public readonly optional!: HasOptional<
        F,
        never,
        () => StringSchema<[...F, Flags.Optional]>
    >
    public readonly readonly!: HasReadonly<
        F,
        never,
        () => StringSchema<[...F, Flags.Readonly]>
    >
}

interface SchemaInterface {
    <T extends Record<string, Schema<any, any>>>(
        input: T
    ): ShapeSchema<
        InferShape<T>,
        []
    >

    shape<T extends Record<string, Schema<any, any>>>(
        input: T
    ): ShapeSchema<
        InferShape<T>,
        []
    >

    number(): NumberSchema<[]>

    string(): StringSchema<[]>
}

const $ = null as unknown as SchemaInterface

const AddressSchema = $({
    street: $.string(),
    apartment: $.string().optional(),
    country: $.string(),
    code: $({
        prefix: $.number(),
        postfix: $.number(),
        code: $.string()
    }).readonly().optional()
}).optional()

type Address = Infer<typeof AddressSchema>