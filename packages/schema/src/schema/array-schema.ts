
import { TypeValidator } from '../validator'

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
    ApplyMutable
} from './schema'

import { push } from '@benzed/immutable'
import { isArray, isString } from '@benzed/is'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type ArraySchemaInput = Schema<any, any, any>
type ArraySchemaOutput<T extends ArraySchemaInput> = SchemaOutput<T>[]

/*** Helper ***/

function tryCastToArray(input: unknown): unknown {

    if (isString(input)) {
        const arr = input.split(',')
        if (isArray(arr))
            return arr
    }

    return input
}

/*** Main ***/

class ArraySchema<

    I extends ArraySchemaInput,
    O extends ArraySchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, ApplyMutable<F, O>, F> {

    protected _typeValidator = new TypeValidator({
        name: 'array',
        is: isArray as unknown as (input: unknown) => input is ApplyMutable<F, O>,
        cast: tryCastToArray
    })

    protected _validateChildren(
        input: O,
        inputContext: Partial<SchemaValidationContext>
    ): ApplyMutable<F, O> {

        const context = {
            path: [],
            transform: false,
            ...inputContext,
        }

        const { _input: childSchema } = this

        const output = [...input]

        for (let i = 0; i < output.length; i++) {
            output[i] = childSchema['_validate'](
                output[i],
                {
                    ...context,
                    path: push(context.path, i)
                }
            )
        }

        return output as unknown as ApplyMutable<F, O>
    }

    public constructor (input: I, ...flags: F) {

        super(input, ...flags)

        // Default to an empty array if that is valid
        const defaultArr: unknown = []
        if (this.is(defaultArr)) {
            this._defaultValidator.applySettings({
                default: defaultArr
            })
        }
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => ArraySchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => ArraySchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => ArraySchema<I, O>

}

/*** Expors ***/

export default ArraySchema

export {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput,

    tryCastToArray,
}