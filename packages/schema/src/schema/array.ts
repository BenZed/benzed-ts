
import { push } from '@benzed/immutable'
import { is } from '@benzed/is'

import {
    TypeValidator
} from '../validator/type'

import {
    LengthValidator,
    LengthValidatorSettingsShortcut,
    toLengthValidatorSettings,
} from '../validator/length'

import { 
    DefaultValidatorSettings 
} from '../validator/default'

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

import { safeJsonParse } from '../util'

/* eslint-disable  @typescript-eslint/no-explicit-any */

//// Types ////

type ArraySchemaInput = Schema<any, any, any>
type ArraySchemaOutput<T extends ArraySchemaInput> = SchemaOutput<T>[]

//// Helper ////

function tryCastToArray(input: unknown): unknown {
    return is.string(input)
        ? safeJsonParse(input, is.array) ?? input
        : input
}

//// Main ////

class ArraySchema<

    I extends ArraySchemaInput,
    O extends ArraySchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, ApplyMutable<F, O>, F> {

    get $item(): I {
        return this._input
    }

    protected _typeValidator = new TypeValidator({
        name: 'array',
        article: 'an',
        is: is.array as unknown as (input: unknown) => input is ApplyMutable<F, O>,
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

    //// Schema Chain Methods ////

    override default(defaultValue?: DefaultValidatorSettings<O>['default']): this {
        return super.default(defaultValue ?? [] as any)
    }

    length(...input: LengthValidatorSettingsShortcut): this {
        const settings = toLengthValidatorSettings(input)

        return this._copyWithPostTypeValidator('length', new LengthValidator(settings))
    }

    override readonly optional!: HasOptional<
    /**/ F, never, ArraySchema<I, O, AddFlag<Flags.Optional, F>>
    >

    override readonly mutable!: HasMutable<
    /**/ F, never, ArraySchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    override readonly clearFlags!: () => ArraySchema<I, O>

}

//// Expors ////

export default ArraySchema

export {
    ArraySchema,
    ArraySchemaInput,
    ArraySchemaOutput,

    tryCastToArray,
}