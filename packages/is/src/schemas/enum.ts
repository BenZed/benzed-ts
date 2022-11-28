import { extend } from '@benzed/immutable/lib'
import { defineName } from '@benzed/util/lib'
import { schema, Schema } from '../schema'
import { Validator, validator } from '../validator'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Symbols ////

const $$enum = Symbol('enum-validator')

//// Types ////

type Enumerable = string | number | boolean | null | bigint

interface EnumSchema<T extends Enumerable> extends Schema<T> {
    get options(): T[]
}

interface EnumValidator<T extends readonly Enumerable[]> extends Validator<unknown, T[number]> {
    options: T
}

//// Setup ////

const enumValidator = validator(defineName({

    options: [] as any[],

    assert(input: unknown): boolean {
        return this.options.includes(input)
    },

    error(this: EnumSchema<any>) {

        const { options } = this

        return options.length >= 1 
            ? `must be one of ${options.slice(0, -1).join(', ')} or ${options.at(-1)}`
            : `must be ${options.at(0)}`
    }

}, 'enum'))

const enumSchematic: EnumSchema<any> = schema(enumValidator, $$enum).extend({

    get options() {
        return this
            .getValidator<EnumValidator<any>>($$enum)
            ?.options ?? []
    }

} as EnumSchema<any>)

//// Exports ////

export function enumSchema<T extends readonly Enumerable[]>(...options: T): EnumSchema<T[number]> {

    const enumValidate = extend(enumValidator, { options })

    return enumSchematic.validates(enumValidate, $$enum)

}