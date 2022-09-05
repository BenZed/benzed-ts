import { push } from '@benzed/immutable'
import { isPlainObject } from '@benzed/is'
import { Compile, Merge } from '@benzed/util'
import { TypeValidator } from '../validator'

import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { ApplyOptional, SchemaOutput, SchemaValidationContext } from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/indent
*/

/*** Types ***/

type IsMutableAndOptional<I, Y, N = never> =
    HasMutable<I, HasOptional<I, Y, N>, N>

type IsMutableNotOptional<I, Y, N = never> =
    HasMutable<I, HasOptional<I, N, Y>, N>

type IsOptionalNotMutable<I, Y, N = never> =
    HasOptional<I, HasMutable<I, N, Y>, N>

type NotMutableNotOptional<I, Y, N = never> =
    HasOptional<I, N, HasMutable<I, N, Y>>

type Shape = { [key: string]: any }

type ShapeSchemaInput = { [key: string]: Schema<any, any, any> }

type ShapeSchemaOutput<T extends ShapeSchemaInput> =
    Compile<
        Merge<[
            { readonly [K in keyof T as NotMutableNotOptional<T[K], K>]: SchemaOutput<T[K]> },
            { readonly [K in keyof T as IsOptionalNotMutable<T[K], K>]?: SchemaOutput<T[K]> },
            { [K in keyof T as IsMutableAndOptional<T[K], K>]?: SchemaOutput<T[K]> },
            { [K in keyof T as IsMutableNotOptional<T[K], K>]: SchemaOutput<T[K]> }
        ]>
    >

/*** Main ***/

class ShapeSchema<
    I extends ShapeSchemaInput,
    O extends ShapeSchemaOutput<I>,
    F extends Flags[] = []
/**/> extends Schema<I, O, F> {

    protected _typeValidator = new TypeValidator({
        name: 'object',
        is: (input): input is O => isPlainObject(input)
    })

    protected override _validate(
        input: unknown,
        inputContext: Partial<SchemaValidationContext>
    ): ApplyOptional<F, O> {

        const context = {
            path: [],
            transform: false,
            ...inputContext,
        }

        const output = super._validate(input, context)
        if (output === undefined)
            return output as ApplyOptional<F, O>

        return this._validateChildren(output, context) as ApplyOptional<F, O>
    }

    private _validateChildren(
        input: Shape,
        inputContext: Partial<SchemaValidationContext>
    ): O {

        const context = {
            path: [],
            transform: false,
            ...inputContext,
        }

        const { _input: childSchemas } = this

        const output = input

        for (const key in childSchemas) {
            const childSchema = childSchemas[key]

            output[key] = childSchema['_validate'](
                output[key],
                {
                    ...context,
                    path: push(context.path, key)
                }
            )
        }

        return output as O
    }

    public constructor (input: I, ...flags: F) {

        super(input, ...flags)

        // Create default
        const defaultShape: Shape = {}
        for (const key in input) {
            const childSchema = input[key]
            const output = childSchema.create()
            if (output !== undefined)
                defaultShape[key] = output
        }

        // Apply default if it is valid
        if (this.is(defaultShape)) {
            this._defaultValidator.applySettings({
                default: defaultShape
            })
        }
    }

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => ShapeSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => ShapeSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ShapeSchema<I, O>

}

/*** Exports ***/

export default ShapeSchema

export {

    Shape,

    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput

}
