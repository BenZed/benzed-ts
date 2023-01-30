import { AnyValidate, ValidateContext, Validator } from '@benzed/schema'
import { isObject, keysOf, safeJsonParse, TypeOf, isString } from '@benzed/util'

import { Optional, ReadOnly } from '../mutator/mutators'
import Type, { TypeExtendSettings } from './type'

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

type ShapeOutput<T extends ShapeInput> = 
    // ShapeReadOnlyOutput<T> &
    // ShapeReadOnlyOptionalOutput<T> &
    // ShapeOptionalOutput<T> &
    ShapeNominalOutput<T>

//// Types //// 

type ShapeInput = {
    [key: string | number | symbol]: AnyValidate
}

//// Tuple ////  

class Shape<T extends ShapeInput> extends Type<ShapeOutput<T>> {

    get types(): T {
        const [mainValidator] = this
        return (mainValidator as Validator<unknown, ShapeOutput<T>> & { types: T }).types
    }

    constructor(types: T) {

        type O = ShapeOutput<T>

        super({

            name: 'shape',

            types,

            isValid(this: Shape<T>, input: unknown): input is ShapeOutput<T> {

                if (!isObject<O>(input))
                    return false 

                for (const key of keysOf(this.types)) {
                    const type = this.types[key]
                    if (!type(types[key]))
                        return false
                }

                return true
            },

            cast(this: Shape<T>, input: unknown, ctx: ValidateContext<unknown>): unknown {
                if (isString(input)) 
                    return safeJsonParse(input)

                if (!isObject<O>(input))
                    return input

                const output = {} as any
                for (const key of keysOf(this.types)) {

                    const property = this.types[key]

                    output[key] = property instanceof Type && property.typeValidator.cast
                        ? property.typeValidator.cast(input[key], { ...ctx, path: [ ...ctx.path, key ], input: input[key] }) as O[keyof O]
                        : input[key] 
                }

                return output
            },

            default(ctx: ValidateContext<unknown>): unknown {
                const output = {} as O
                for (const key of keysOf(this.properties)) {

                    const property = this.properties[key]

                    if (property instanceof Type && property.typeValidator.default)
                        output[key] = property.typeValidator.default({ ...ctx, path: [ ...ctx.path, key ] })
                }

                return output
            },

            transform(input: unknown, ctx: ValidateContext<unknown>): unknown {

                if (!isObject<O>(input))
                    return input 

                const output = {} as O
                for (const key of keysOf(this.properties)) {

                    const property = this.properties[key]
                    
                    output[key] = property.validate(input[key], { 
                        ...ctx,
                        path: [...ctx.path, key ], 
                        value: input[key] 
                    } as ValidateContext<unknown>) as O[keyof O]
                }

                return output
            }

        })
    }
}

//// Exports ////

export default Shape

export {
    Shape,
    ShapeInput,
    ShapeOutput
}