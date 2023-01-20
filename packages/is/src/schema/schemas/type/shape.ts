import { isObject, isString, keysOf, safeJsonParse, Infer, TypeOf, nil, TypeGuard, isArray, isNumber, isBoolean } from '@benzed/util'

import { TypeValidatorSettings, ValidatorContext } from '../../../validator'
import { AnySchematic } from '../../schematic'
import { Number } from './numeric'
import Type from './type'

import { ReadOnly, Optional } from '../../../is'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
*/

//// Helper Types ////

type ShapeReadOnlyOutput<T extends ShapeInput> = {
    +readonly [K in keyof T as T[K] extends ReadOnly<any> ? T[K] extends Optional<any> ? never : K : never]-?: TypeOf<T[K]>
}

type ShapeReadOnlyOptionalOutput<T extends ShapeInput> = {
    +readonly [K in keyof T as T[K] extends ReadOnly<any> ? T[K] extends Optional<any> ? K : never : never]+?: TypeOf<T[K]>
}

type ShapeOptionalOutput<T extends ShapeInput> = {
    -readonly[K in keyof T as T[K] extends ReadOnly<any> ? never : T[K] extends Optional<any> ? K : never]+?: TypeOf<T[K]>
}

type ShapeNominalOutput<T extends ShapeInput> = {
    -readonly[K in keyof T as T[K] extends ReadOnly<any> ? never : T[K] extends Optional<any> ? never : K]-?: TypeOf<T[K]>
}

type ShapeOutputIntersection<T extends ShapeInput> = 
    // ShapeReadOnlyOutput<T> &
    // ShapeReadOnlyOptionalOutput<T> &
    // ShapeOptionalOutput<T> &
    ShapeNominalOutput<T>

//// Types //// 

type ShapeInput = {
    [key: string | number | symbol]: AnySchematic
}

type ShapeOutput<T extends ShapeInput> = 
    ShapeOutputIntersection<T> extends infer O ? O : never

//// Tuple ////  

class Shape<T extends ShapeInput> extends Type<ShapeOutput<T>> {

    get types(): T {
        return (this.typeValidator as unknown as { types: T }).types
    }

    constructor(properties: T) {

        type O = ShapeOutput<T>

        super({

            name: 'shape',

            properties,

            is(input: unknown): input is ShapeOutput<T> {

                if (!isObject<O>(input))
                    return false 

                for (const key of keysOf(this.properties)) {
                    const property = this.properties[key]
                    if (!property(input[key]))
                        return false
                }

                return true
            },

            cast(input: unknown, ctx: ValidatorContext<unknown>): unknown {
                if (isString(input)) 
                    return safeJsonParse(input)

                if (!isObject<O>(input))
                    return input

                const output = {} as O
                for (const key of keysOf(this.properties)) {

                    const property = this.properties[key]

                    output[key] = property instanceof Type && property.typeValidator.cast
                        ? property.typeValidator.cast(input[key], { ...ctx, path: [ ...ctx.path, key ], input: input[key] }) as O[keyof O]
                        : input[key] 
                }

                return output
            },

            default(ctx: ValidatorContext<unknown>): unknown {
                const output = {} as O
                for (const key of keysOf(this.properties)) {

                    const property = this.properties[key]

                    if (property instanceof Type && property.typeValidator.default)
                        output[key] = property.typeValidator.default({ ...ctx, path: [ ...ctx.path, key ] })
                }

                return output
            },

            transform(input: unknown, ctx: ValidatorContext<unknown>): unknown {

                if (!isObject<O>(input))
                    return input 

                const output = {} as O
                for (const key of keysOf(this.properties)) {

                    const property = this.properties[key]
                    
                    output[key] = property.validate(input[key], { 
                        ...ctx,
                        path: [...ctx.path, key ], 
                        input: input[key] 
                    } as ValidatorContext<unknown>) as O[keyof O]
                }

                return output
            }

        } as TypeValidatorSettings<ShapeOutput<T>> & { properties: T })
    }
}

//// Exports ////

export default Shape

export {
    Shape,
    ShapeInput,
    ShapeOutput
}