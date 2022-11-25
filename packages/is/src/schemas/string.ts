import { toCamelCase, capitalize, toDashCase } from '@benzed/string'

import { ErrorMessage } from '../validator'
import { typeSchema, TypeSchema } from './type'

//// Type ////

interface StringSchema<S extends string> extends TypeSchema<S> {

    trim(error?: string | ErrorMessage<string>): this

    upperCase(error?: string | ErrorMessage<string>): this

    lowerCase(error?: string | ErrorMessage<string>): this

    dashCase(error?: string | ErrorMessage<string>): this

    camelCase(error?: string | ErrorMessage<string>): this

    pascalCase(error?: string | ErrorMessage<string>): this

    capitalize(error?: string | ErrorMessage<string>): this

}

//// Boolean ////

const string: StringSchema<string> = typeSchema({

    name: 'string',

    assert(this: StringSchema<string>, input: unknown): input is string {
        return typeof input === 'string'
    },

    cast(value: unknown): unknown {
        return value
    }

}).extend({

    trim(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            i => i.trim(),
            error ?? 'must not have whitespace at beginning or end'
        )
    },

    upperCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            i => i.toUpperCase(),
            error ?? 'must be UPPERCASE'
        )
    },

    lowerCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            i => i.toLowerCase(),
            error ?? 'must be lowercase'
        )
    },

    dashCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toDashCase,
            error ?? 'must be dash-case'
        )
    },

    camelCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toCamelCase,
            error ?? 'must be camelCase'
        )
    },

    pascalCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            i => capitalize(toCamelCase(i)),
            error ?? 'must be PascalCase'
        )
    },

    capitalize(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            capitalize,
            error ?? 'must be Capitalized'
        )
    }

})

//// Exports ////

export default string

export {
    string,
    StringSchema
}