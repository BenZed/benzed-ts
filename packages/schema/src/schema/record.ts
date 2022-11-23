
import { is } from '@benzed/is'
import { push } from '@benzed/immutable'

import { TypeValidator } from '../validator/type'
import { AddFlag, Flags, HasMutable, HasOptional } from './flags'

import Schema, { ParentSchema, SchemaOutput, SchemaValidationContext } from './schema'

import StringSchema from './string'
import NumberSchema from './number'
import UnionSchema from './union'

/* eslint-disable  @typescript-eslint/no-explicit-any */

//// Types ////

type RecordSchemaInput = 
    [ 
        value: Schema<any, any, any> 
    ] |
    [
        key:
        NumberSchema<any> |
        StringSchema<any> |
        UnionSchema<any, string | number, any>,
        values: Schema<any, any, any>
    ]

type RecordSchemaKeyValueOutput<
    K extends Schema<any, any, any>,
    V extends Schema<any, any, any>
> = HasMutable<
/**/ V,
/**/ { [KEY in SchemaOutput<K>]: SchemaOutput<V> },
/**/ { readonly [KEY in SchemaOutput<K>]: SchemaOutput<V> }
>

type RecordSchemaOutput<T extends RecordSchemaInput> =
    T[1] extends Schema<any, any, any>
    /**/ ? RecordSchemaKeyValueOutput<T[0], T[1]>
    /**/ : RecordSchemaKeyValueOutput<StringSchema<any>, T[0]>

//// Main ////

class RecordSchema<
    /**/

    I extends RecordSchemaInput,
    O extends RecordSchemaOutput<I>,
    F extends Flags[] = []

    /**/> extends ParentSchema<I, O, F> {

    protected _typeValidator = new TypeValidator({
        name: 'object',
        article: 'an',
        is: (input): input is O => is.object(input),
    })

    protected override _validateChildren(input: O, inputContext: SchemaValidationContext): O {

        const { _input: subSchemas } = this

        const [keySchema, valueSchema] = (
            subSchemas.length === 2
                ? subSchemas
                : [null, ...subSchemas]
        ) as [Schema<any, any, any>, Schema<any, any, any>]

        const output = {} as O

        for (const key in input) {

            const value = input[key]

            const keyContext = {
                ...inputContext,
                path: push(inputContext.path, key)
            }

            const validKey = keySchema
                ? keySchema['_validate'](key, keyContext) as typeof key
                : key

            output[validKey] = valueSchema['_validate'](value, keyContext)
        }

        return output
    }

    get $key() : I[0] {
        return this._input[0]
    }

    get $value() : I[1] {
        return this._input[1]
    }

    override readonly optional!: HasOptional<
    /**/ F, never, RecordSchema<I, O, AddFlag<Flags.Optional, F>>
    >

    override readonly mutable!: HasMutable<
    /**/ F, never, RecordSchema<I, O, AddFlag<Flags.Mutable, F>>
    >

    override readonly clearFlags!: () => RecordSchema<I, O>

    override default(defaultValue = {} as O): this {
        return super.default(defaultValue)
    }

}

//// Expors ////

export default RecordSchema

export {
    RecordSchema,
    RecordSchemaInput,
    RecordSchemaOutput
}