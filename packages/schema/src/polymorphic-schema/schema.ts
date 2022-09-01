import { Merge, Compile } from '@benzed/util'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/indent */

enum Flags {
    Readonly,
    Optional
}

type GetFlags<I> = I extends Flags[]
    ? I
    : I extends Schema<any, any, infer F>
    ? F
    : never

type IsOptionalReadonly<I, Y, N = never> =
    GetFlags<I> extends [Flags.Readonly, Flags.Optional] | [Flags.Optional, Flags.Readonly]
    /**/ ? Y
    /**/ : N

type IsReadonly<I, Y, N = never> = GetFlags<I> extends [Flags.Readonly]
    ? Y
    : N

type IsOptional<I, Y, N = never> = GetFlags<I> extends [Flags.Optional]
    ? Y
    : N

type HasFlag<I, F extends Flags, Y, N = never> =
    GetFlags<I> extends [infer F1, ...infer FN]
    ? F1 extends F

    /**/ ? Y
    /**/ : FN extends Flags[]

        /**/ ? HasFlag<FN, F, Y, N>
        /**/ : N

    : N

type HasReadonly<I, Y, N = never> = HasFlag<I, Flags.Readonly, Y, N>

type HasOptional<I, Y, N = never> = HasFlag<I, Flags.Optional, Y, N>

abstract class Schema<I, O, F extends Flags[]> {

    public readonly flags: F

    private readonly input!: I
    private readonly output!: O

    public constructor (...flags: F) {
        this.flags = flags
        this.optional = null as any
        this.readonly = null as any
    }

    public readonly optional: HasOptional<
        F,
        never,
        () => Schema<I, O, [...F, Flags.Optional]>
    >

    public readonly readonly: HasReadonly<
        F,
        never,
        () => Schema<I, O, [...F, Flags.Readonly]>
    >

}

type Infer<S extends Schema<any, any, any>> = Compile<SchemaOutput<S>>

type SchemaOutput<S extends Schema<any, any, any>> = S extends Schema<any, infer O, infer F>
    ? HasOptional<F, O | undefined, O>
    : never

type ShapeSchemaInput = { [key: string]: Schema<any, any, any> }

type ShapeSchemaOutput<T extends ShapeSchemaInput> =
    Merge<[
        { readonly [K in keyof T as IsReadonly<T[K], K>]: SchemaOutput<T[K]> },
        { readonly [K in keyof T as IsOptionalReadonly<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as IsOptional<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as GetFlags<T[K]> extends [] ? K : never]: SchemaOutput<T[K]> }
    ]>

class ShapeSchema<I, O, F extends Flags[]> extends Schema<I, O, F> {

    public readonly optional!: HasOptional<
        F, never, () => ShapeSchema<I, O, [...F, Flags.Optional]>
    >

    public readonly readonly!: HasReadonly<
        F, never, () => ShapeSchema<I, O, [...F, Flags.Readonly]>
    >
}

class NumberSchema<F extends Flags[]> extends Schema<void, number, F> {

    public readonly optional!: HasOptional<
        F, never, () => NumberSchema<[...F, Flags.Optional]>
    >

    public readonly readonly!: HasReadonly<
        F, never, () => NumberSchema<[...F, Flags.Readonly]>
    >

}

class StringSchema<F extends Flags[]> extends Schema<void, string, F> {

    public readonly optional!: HasOptional<
        F, never, () => StringSchema<[...F, Flags.Optional]>
    >

    public readonly readonly!: HasReadonly<
        F, never, () => StringSchema<[...F, Flags.Readonly]>
    >

}

interface SchemaInterface {

    <I extends ShapeSchemaInput, O extends ShapeSchemaOutput<I>>(
        input: I
    ): ShapeSchema<I, O, []>

    shape<I extends ShapeSchemaInput, O extends ShapeSchemaOutput<I>>(
        input: I
    ): ShapeSchema<I, O, []>

    number(): NumberSchema<[]>

    string(): StringSchema<[]>
}

export const $ = null as unknown as SchemaInterface

export { Infer }