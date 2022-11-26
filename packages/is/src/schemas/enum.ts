import { Primitive } from '@benzed/util/lib'
import { schema, Schema } from '../schema'
import { validator, Validator } from '../validator'

//// Symbols ////

const $$enum = Symbol('enum-validator')

//// Types ////

interface EnumSchema<T extends Primitive> extends Schema<T> {
    options: T[]
}

interface EnumValidator<T extends readonly Primitive[]> extends Validator<unknown, T[number]> {
    options: T
}

const enumValidator = validator({

    options: [] as unknown[],

    assert(input: unknown): boolean {
        return this.options.includes(input)
    },

}, $$enum)

const enumSchematic = schema(enumValidator)

//// Exports ////

export function enumSchema<O extends readonly Primitive[]>(...options: O): EnumSchema<O[number]> {

    return enumSchematic.validates({ [$$enum]: true, options }) as EnumSchema<O[number]>

}