import { $$copy, $$equals, copy, CopyComparable } from '@benzed/immutable'

import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type SchemaOutput<S extends Schema<any, any, any>> = S extends Schema<any, infer O, infer F>
    ? HasOptional<F, O | undefined, O>
    : never

type Primitive = string | number | boolean | null | undefined

/*** Main ***/

abstract class Schema<I, O, F extends Flags[] = []> implements CopyComparable<Schema<I, O, F>> {

    protected readonly _flags: F
    protected readonly _input: I
    protected readonly _output!: O

    // Construct

    public constructor (input: I, ...flags: F) {
        this._input = input
        this._flags = flags
    }

    // Data Methods

    public is(input: unknown): input is O {
        try {
            this.assert(input)
            return true
        } catch {
            return false
        }
    }

    public assert(input: unknown, _msg = 'incorrect type'): asserts input is O {
        void this._validate(input, false)
    }

    public validate(input: unknown): O {
        return this._validate(input, true)
    }

    public create(): O {
        return copy(this._output)
    }

    // Schema Methods

    /**
     * @returns schema with optional flag
     */
    public readonly optional = this._copyWithFlag.bind(this, Flags.Optional) as unknown

    /**
     * @returns schema with mutable flag 
     */
    public readonly mutable = this._copyWithFlag.bind(this, Flags.Mutable) as unknown

    public get isOptional(): boolean {
        return this._flags.includes(Flags.Optional)
    }

    public get isMutable(): boolean {
        return this._flags.includes(Flags.Mutable)
    }

    /**
     * @returns schema without optional or mutable flags.
     */
    public readonly clearFlags = (() => {
        const schema = this[$$copy]()
        schema._flags.length = 0
        return schema as any
    }) as unknown

    // Helper

    private _validate(input: unknown, sanitize: boolean): O {
        void input
        void sanitize
        throw new Error('Not yet implemented.')
    }

    private _copyWithFlag(flag: Flags): this {

        if (this._flags.includes(flag))
            throw new Error(`Schema is already ${Flags[flag]}`)

        const schema = this[$$copy]()
        schema._flags.push(flag)

        return schema
    }

    // CopyComparable 

    public [$$copy](): this {
        const ThisSchema = this.constructor as new (input: I, ...flags: Flags[]) => this
        const schema = new ThisSchema(this._input, ...this._flags)
        return schema
    }

    public [$$equals](input: unknown): input is this {
        throw new Error('Not yet implemented.')
    }
}

abstract class PrimitiveSchema
/**/<
    I extends Primitive,
    F extends Flags[] = []
/**/>
    extends Schema<I, I, F> { }

class NullSchema<F extends Flags[] = []> extends PrimitiveSchema<null, F> {
    public constructor (...flags: F) {
        super(null, ...flags)
    }

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => NullSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => NullSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => NullSchema
}

class UndefinedSchema<F extends Flags[] = []> extends PrimitiveSchema<undefined, F> {
    public constructor (...flags: F) {
        super(undefined, ...flags)
    }

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => UndefinedSchema<AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => UndefinedSchema<AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => UndefinedSchema
}

/*** Exports ***/

export default Schema

export {
    Schema,
    SchemaOutput,

    PrimitiveSchema,
    Primitive,
    NullSchema,
    UndefinedSchema,
}

