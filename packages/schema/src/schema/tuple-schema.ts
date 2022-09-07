
import { push } from '@benzed/immutable'
import { isArray, isInstanceOf } from '@benzed/is'

import ValidationError from '../util/validation-error'

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
    ParentSchema,
    Primitive
} from './schema'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

type TupleSchemaInput = readonly (Primitive | Schema<any, any, any>)[]

type TupleSchemaOutput<T extends TupleSchemaInput> = {
    [K in keyof T]: T[K] extends Primitive
    /**/ ? T[K]
    /**/ : T[K] extends Schema<any, any, any>
        // @ts-expect-error T[K] is resolving to Schema<any,any,any> & T[K], which I don't get
        /**/ ? SchemaOutput<T[K]>
        /**/ : unknown
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

    protected _validateChildren(
        input: O,
        context: SchemaValidationContext
    ): ApplyMutable<F, O> {

        const output = [...input]

        for (let i = 0; i < this._input.length; i++) {

            const schema = this._input[i]

            const subContext = {
                ...context,
                path: push(context.path, i)
            }

            if (isInstanceOf(schema, Schema))
                output[i] = schema['_validate'](output[i], subContext)

            // TODO this should be casted to an "Enum Validator" or something
            else if (output[i] !== schema) {
                throw new ValidationError(
                    `Must be ${output[i]}`,
                    subContext.path
                )
            }
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