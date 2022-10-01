
import {
    TypeValidator
} from '../validator/type'

import {
    LengthValidator,
    LengthValidatorSettingsShortcut,
    toLengthValidatorSettings,
} from '../validator/length'

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
import { safeJsonParse } from '../util'
import { DefaultValidatorSettings } from '../validator/default'

/* eslint-disable  @typescript-eslint/no-explicit-any */

/*** Types ***/

type ArraySchemaInput = Schema<any, any, any>
type ArraySchemaOutput<T extends ArraySchemaInput> = SchemaOutput<T>[]

/*** Helper ***/

function tryCastToArray(input: unknown): unknown {
    return isString(input)
        ? safeJsonParse(input, isArray) ?? input
        : input
}

/*** Main ***/

class ArraySchema<

    I extends ArraySchemaInput,
    O extends ArraySchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, ApplyMutable<F, O>, F> {

    public get $item(): I {
        return this._input
    }

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

    /*** Schema Chain Methods ***/

    public override default(defaultValue?: DefaultValidatorSettings<O>['default']): this {
        return super.default(defaultValue ?? [] as any)
    }

    public length(...input: LengthValidatorSettingsShortcut): this {
        const settings = toLengthValidatorSettings(input)

        return this._copyWithPostTypeValidator('length', new LengthValidator(settings))
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