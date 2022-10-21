
import { ParentSchema, Schema, SchemaOutput, SchemaValidationContext } from './schema'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import { copy } from '@benzed/immutable'
import { isObject } from '@benzed/is'
import { Intersect } from '@benzed/util'

import { TypeValidator } from '../validator/type'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type IntersectionSchemaInput = readonly Schema<object, any>[]

type IntersectionSchemaOutput<T extends IntersectionSchemaInput> =
    Intersect<{
        [K in keyof T]: SchemaOutput<T[K]>
    }>

/*** Main ***/

class IntersectionSchema<

    I extends IntersectionSchemaInput,
    O extends IntersectionSchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, O, F> {

    protected _typeValidator = new TypeValidator<O>({
        name: `object`,
        article: `an`,
        is: isObject as (input: unknown) => input is O
    })

    /*** ParentSchema Implementation ***/

    protected _validateChildren(input: O, inputContext: SchemaValidationContext): O {

        const { _input: andSchemas } = this

        const output = {} as O
        for (const schema of andSchemas) {

            const context = copy(inputContext)

            Object.assign(
                output as any,
                schema[`_validate`](input, context)
            )
        }

        return output
    }

    /*** Schema methods ***/

    override readonly optional!: HasOptional<
    /**/ F,
    /**/ never,
    /**/ IntersectionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    override readonly mutable!: HasMutable<
    /**/ F,
    /**/ never,
    /**/ IntersectionSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    override readonly clearFlags!: () => IntersectionSchema<I, O>

}

/*** Exports ***/

export default IntersectionSchema

export {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
}