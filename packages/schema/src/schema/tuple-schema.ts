
import { push } from '@benzed/immutable'
import { isArray } from '@benzed/is'

import {
    LengthValidator,
    TypeValidator
} from '../validator'

import {
    AddFlag,
    Flags,
    HasMutable,
    HasOptional
} from './flags'

import {
    Schema,
    SchemaOutput,
    SchemaValidationContext,

    ApplyMutable,
    ParentSchema
} from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type TupleSchemaInput = readonly Schema<any, any, any>[]

type TupleSchemaOutput<T extends TupleSchemaInput> = {
    [K in keyof T]: SchemaOutput<T[K]>
}

/*** Main ***/

class TupleSchema<
    I extends TupleSchemaInput,
    O extends TupleSchemaOutput<I>,
    F extends Flags[] = []
/**/> extends ParentSchema<I, ApplyMutable<F, O>, F> {

    protected _typeValidator = new TypeValidator({
        name: 'tuple',
        is: (input): input is ApplyMutable<F, O> => isArray(input)
    })

    protected _validators = [
        new LengthValidator<any>({
            //              ^ FIXME don't get why this can't be O
            comparator: '==',
            value: this._input.length,
            error: `must have exactly ${this._input.length} items`
        })
    ]

    public constructor (input: I, ...flags: F) {
        super(input, ...flags)

        this._setPostTypeValidator(
            'tuple-length',
            new LengthValidator({
                comparator: '==',
                value: input.length,
                error: `must have exactly ${input.length} items`
            })
        )
    }

    protected _validateChildren(
        input: O,
        context: SchemaValidationContext
    ): ApplyMutable<F, O> {

        const output = [...input]

        for (let i = 0; i < this._input.length; i++) {

            const schema = this._input[i]

            output[i] = schema['_validate'](output[i], {
                ...context,
                path: push(context.path, i)
            })
        }

        return output as unknown as ApplyMutable<F, O>
    }

    public override readonly optional!: HasOptional<
    /**/ F, never, () => TupleSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    public override readonly mutable!: HasMutable<
    /**/ F, never, () => TupleSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    public override readonly clearFlags!: () => TupleSchema<I, O>

}

/*** Expors ***/

export default TupleSchema

export {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
}