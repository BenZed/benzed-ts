
import { safeJsonParse } from '../util'

import { TypeValidator } from '../validator/type'

import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import {
    Schema,
    ParentSchema,

    SchemaOutput,
    SchemaValidationContext,
    PrimitiveSchema,
} from './schema'

import { isObject, isString } from '@benzed/is'
import { Compile, Merge } from '@benzed/util'
import { push } from '@benzed/immutable'
import { DefaultValidatorSettings } from '../validator/default'

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

/*** Helper ***/

/*** Main ***/

class ShapeSchema<
    I extends ShapeSchemaInput,
    O extends ShapeSchemaOutput<I>,
    F extends Flags[] = []
    /**/> extends ParentSchema<I, O, F> {

    protected _typeValidator = new TypeValidator({
        name: 'object',
        is: isObject as (input: unknown) => input is O,
        cast: (input: unknown) => isString(input)
            ? safeJsonParse(input, isObject) ?? input
            : input,
    })

    protected _validateChildren(
        input: Shape,
        inputContext: Partial<SchemaValidationContext>
    ): O {

        const context = {
            path: [],
            transform: false,
            ...inputContext,
        }

        const { _input: propertySchemas } = this

        const output = {} as Shape

        for (const key in propertySchemas) {
            const propertySchema = propertySchemas[key]

            output[key] = propertySchema['_validate'](
                input[key],
                {
                    ...context,
                    path: push(context.path, key)
                }
            )
        }

        return output as O
    }

    public override readonly optional!: HasOptional<
    /**/ F, () => never, () => ShapeSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, () => never, () => ShapeSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ShapeSchema<I, O>

    public default(defaultValue?: DefaultValidatorSettings<O>['default']): this {

        defaultValue ??= (): O => {
            let output: undefined | O = undefined
            for (const key in this._input) {
                const schema = this._input[key]

                // first used default validator output
                let value = schema['_defaultValidator'].transform(undefined)

                // use identify if primitive
                if (value === undefined && schema instanceof PrimitiveSchema)
                    value = schema['_input']

                // assign if value 
                if (value !== undefined)
                    (output ??= {} as O)[key as unknown as keyof O] = value
            }
            return output as O
        }

        return super.default(defaultValue)
    }

}

/*** Exports ***/

export default ShapeSchema

export {

    Shape,

    ShapeSchema,
    ShapeSchemaInput,
    ShapeSchemaOutput

}
