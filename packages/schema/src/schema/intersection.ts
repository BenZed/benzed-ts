
import { is } from '@benzed/is'
import { copy } from '@benzed/immutable'
import { Intersect } from '@benzed/util'

import { ParentSchema, Schema, SchemaOutput, SchemaValidationContext } from './schema'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import { TypeValidator } from '../validator/type'

/* eslint-disable @typescript-eslint/no-explicit-any */

//// Types ////

type IntersectionSchemaInput = readonly Schema<object, any>[]

type IntersectionSchemaOutput<T extends IntersectionSchemaInput> =
    Intersect<{
        [K in keyof T]: SchemaOutput<T[K]>
    }>

//// Main ////

class IntersectionSchema<

    I extends IntersectionSchemaInput,
    O extends IntersectionSchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, O, F> {

    protected _typeValidator = new TypeValidator<O>({
        name: 'object',
        article: 'an',
        is: is.object as (input: unknown) => input is O
    })

    //// ParentSchema Implementation ////

    protected _validateChildren(input: O, inputContext: SchemaValidationContext): O {

        const { _input: andSchemas } = this

        const output = {} as O
        for (const schema of andSchemas) {

            const context = copy(inputContext)

            Object.assign(
                output as any,
                schema['_validate'](input, context)
            )
        }

        return output
    }

}

interface IntersectionSchema<

    I extends IntersectionSchemaInput,
    O extends IntersectionSchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, O, F> {

    //// Schema methods ////

    readonly optional: HasOptional<
    /**/ F,
    /**/ never,
    /**/ IntersectionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    readonly mutable: HasMutable<
    /**/ F,
    /**/ never,
    /**/ IntersectionSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    readonly clearFlags: () => IntersectionSchema<I, O>

}

//// Exports ////

export default IntersectionSchema

export {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
}