
import { is } from '@benzed/is'
import { push } from '@benzed/immutable'

import {
    TypeValidator
} from '../validator/type'

import {
    LengthValidator
} from '../validator/length'

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
    PrimitiveSchema
} from './schema'
import { DefaultValidatorSettings } from '../validator/default'

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

//// Types ////

type TupleSchemaInput = readonly Schema<any, any, any>[]

type TupleSchemaOutput<T extends TupleSchemaInput> = {
    [K in keyof T]: SchemaOutput<T[K]>
}

//// Main ////

class TupleSchema<
    I extends TupleSchemaInput,
    O extends TupleSchemaOutput<I>,
    F extends Flags[] = []
/**/> extends ParentSchema<I, ApplyMutable<F, O>, F> {

    protected _typeValidator = new TypeValidator({
        name: 'tuple',
        article: 'a',
        is: is.array as unknown as (input: unknown) => input is ApplyMutable<F, O>
    })

    constructor (input: I, ...flags: F) {
        super(input, ...flags)

        // Set length validator
        this._setPostTypeValidator(
            'tuple-length',
            new LengthValidator({
                comparator: '==',
                value: input.length,
                error: `must have exactly ${input.length} items`
            })
        )
    }

    //// Helper ////

    get values(): I {
        return this._input
    }

    //// Chain Interface ////

    override default(defaultValue?: DefaultValidatorSettings<ApplyMutable<F, O>>['default']): this {

        defaultValue ??= (): ApplyMutable<F, O> => {
            const output = [] as unknown[]
            for (const schema of this._input) {

                // first used default validator output
                let value = schema['_defaultValidator'].transform(undefined)

                // use identify if primitive
                if (value === undefined && schema instanceof PrimitiveSchema)
                    value = schema['_input']

                output.push(value)
            }
            return output as unknown as ApplyMutable<F, O>
        }

        return super.default(defaultValue)
    }

    //// Implementation ////

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
}

interface TupleSchema<
    I extends TupleSchemaInput,
    O extends TupleSchemaOutput<I>,
    F extends Flags[] = []
/**/> {
    
    readonly optional: HasOptional<
    /**/ F, never, TupleSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    readonly mutable: HasMutable<
    /**/ F, never, TupleSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    readonly clearFlags: () => TupleSchema<I, O>

}

//// Expors ////

export default TupleSchema

export {
    TupleSchema,
    TupleSchemaInput,
    TupleSchemaOutput
}