
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/indent */
type Merge<A, B, C, D> =
    {
        [K in keyof (A & B & C & D)]: (A & B & C & D)[K]
    }

enum Flags {
    Readonly,
    Optional
}

type GetFlags<INPUT> = INPUT extends Flags[]
    ? INPUT
    : INPUT extends Schema<any, any, infer FLAGS>
    ? FLAGS
    : never

type IsOptionalReadonly<INPUT, Y, N = never> =
    GetFlags<INPUT> extends [Flags.Readonly, Flags.Optional] | [Flags.Optional, Flags.Readonly]
    /**/ ? Y
    /**/ : N

type IsReadonly<INPUT, Y, N = never> = GetFlags<INPUT> extends [Flags.Readonly]
    ? Y
    : N

type IsOptional<INPUT, Y, N = never> = GetFlags<INPUT> extends [Flags.Optional]
    ? Y
    : N

type HasFlag<INPUT, FLAGS extends Flags, Y, N = never> =
    GetFlags<INPUT> extends [infer FIRST, ...infer REST]
    ? FIRST extends FLAGS

    /**/ ? Y
    /**/ : REST extends Flags[]

        /**/ ? HasFlag<REST, FLAGS, Y, N>
        /**/ : N

    : N

type HasReadonly<INPUT, Y, N = never> = HasFlag<INPUT, Flags.Readonly, Y, N>

type HasOptional<INPUT, Y, N = never> = HasFlag<INPUT, Flags.Optional, Y, N>

abstract class Schema<INPUT, OUTPUT, FLAGS extends Flags[]> {

    public readonly flags: FLAGS

    private readonly input!: INPUT
    private readonly output!: OUTPUT

    public constructor (...flags: FLAGS) {
        this.flags = flags
    }

    public abstract readonly optional: HasOptional<
        FLAGS,
        never,
        () => Schema<INPUT, OUTPUT, [...FLAGS, Flags.Optional]>
    >

    public abstract readonly readonly: HasReadonly<
        FLAGS,
        never,
        () => Schema<INPUT, OUTPUT, [...FLAGS, Flags.Readonly]>
    >

}

type SchemaOutput<S extends Schema<any, any, any>> = S extends Schema<any, infer O, infer F>
    ? HasOptional<F, O | undefined, O>
    : never

type SchemaShapeInput = { [key: string]: Schema<any, any, any> }

type SchemaShapeOutput<T extends SchemaShapeInput> =
    Merge<
        { readonly [K in keyof T as IsReadonly<T[K], K>]: SchemaOutput<T[K]> },
        { readonly [K in keyof T as IsOptionalReadonly<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as IsOptional<T[K], K>]?: SchemaOutput<T[K]> },
        { [K in keyof T as GetFlags<T[K]> extends [] ? K : never]: SchemaOutput<T[K]> }
    >

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

    <I extends SchemaShapeInput, O extends SchemaShapeOutput<I>>(
        input: I
    ): ShapeSchema<I, O, []>

    shape<I extends SchemaShapeInput, O extends SchemaShapeOutput<I>>(
        input: I
    ): ShapeSchema<I, O, []>

    number(): NumberSchema<[]>

    string(): StringSchema<[]>
}

export const $ = null as unknown as SchemaInterface

export { SchemaOutput }