import { toCamelCase, capitalize, toDashCase } from '@benzed/string'
import { chain } from '@benzed/util'

import { ErrorMessage } from '../validator'
import { typeSchema, TypeSchema } from './type'

//// Symbols ////

const $$trim = Symbol('trim-validator')
const $$case = Symbol('case-validator')
const $$start = Symbol('start-with-validator')
const $$end = Symbol('end-with-validator')

//// Helper ////

const toPascalCase = chain(toCamelCase).link(capitalize)
const toUpperCase = (i: string):string => i.toUpperCase()
const toLowerCase = (i: string):string => i.toLowerCase()
const trim = (i: string):string => i.trim()

//// Type ////

interface StringSchema<S extends string> extends TypeSchema<S> {

    trim(error?: string | ErrorMessage<string>): this

    upperCase(error?: string | ErrorMessage<string>): this

    lowerCase(error?: string | ErrorMessage<string>): this

    dashCase(error?: string | ErrorMessage<string>): this

    camelCase(error?: string | ErrorMessage<string>): this

    pascalCase(error?: string | ErrorMessage<string>): this

    capitalize(error?: string | ErrorMessage<string>): this

    startsWith(value: string, error?: string | ErrorMessage<string>): this

    endsWith(value: string, error?: string | ErrorMessage<string>): this

    contains(value: string, error?: string | ErrorMessage<string>): this

}

//// Boolean ////

const string: StringSchema<string> = typeSchema({

    type: 'string',

    assert(this: StringSchema<string>, input: unknown): input is string {
        return typeof input === 'string'
    },

    cast(value: unknown): unknown {

        if (typeof value === 'number')
            return value.toString()

        if (Array.isArray(value))
            return value.join()
                
        return value
    }

}).extend({

    trim(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            trim,
            error ?? 'must not have whitespace at beginning or end',
            $$trim
        )
    },

    upperCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toUpperCase,
            error ?? 'must be UPPERCASE',
            $$case
        )
    },

    lowerCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toLowerCase,
            error ?? 'must be lowercase',
            $$case
        )
    },

    dashCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toDashCase,
            error ?? 'must be dash-case',
            $$case
        )
    },

    camelCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toCamelCase,
            error ?? 'must be camelCase',
            $$case
        )
    },

    pascalCase(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            toPascalCase,
            error ?? 'must be PascalCase',
            $$case
        )
    },

    capitalize(this: StringSchema<string>, error?: string | ErrorMessage<string>) {
        return this.transforms(
            capitalize,
            error ?? 'must be Capitalized',
            $$case
        )
    },

    startsWith(this: StringSchema<string>, start: string, error?: string | ErrorMessage<string>) {
        return this.transforms(
            i => i.startsWith(start) ? i : start + i, 
            error ?? `must start with "${start}"`,
            $$start
        )
    },

    endsWith(this: StringSchema<string>, end: string, error?: string | ErrorMessage<string>) {
        return this.transforms(
            i => i.endsWith(end) ? i : i + end, 
            error ?? `must end with "${end}"`,
            $$end
        )
    },

    contains(this: StringSchema<string>, value: string, error?: string | ErrorMessage<string>) {
        return this.asserts(
            i => i.includes(value), 
            error ?? `must contain value "${value}"`,
            `contains-${value}`
        )
    }

})

//// Exports ////

export default string

export {
    string,
    StringSchema
}