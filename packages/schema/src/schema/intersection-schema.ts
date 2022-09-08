
import { TypeValidator } from '../validator'
import { ParentSchema, Schema, SchemaOutput, SchemaValidationContext } from './schema'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import { copy } from '@benzed/immutable'
import { isObject } from '@benzed/is'
import { Intersect } from '@benzed/util'

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
        name: 'intersection',
        error: value => `${value} is not object`,
        is: isObject as (input: unknown) => input is O
    })

    /*** ParentSchema Implementation ***/

    protected _validateChildren(input: O, inputContext: SchemaValidationContext): O {

        const { _input: andSchemas } = this

        let output = input
        for (const schema of andSchemas)
            output = schema['_validate'](output, copy(inputContext))

        return output
    }

    /*** Schema methods ***/

    public override readonly optional!: HasOptional<
    /**/ F,
    /**/ never,
    /**/ () => IntersectionSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F,
    /**/ never,
    /**/ () => IntersectionSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => IntersectionSchema<I, O>

}

/*** Exports ***/

export default IntersectionSchema

export {
    IntersectionSchema,
    IntersectionSchemaInput,
    IntersectionSchemaOutput
}