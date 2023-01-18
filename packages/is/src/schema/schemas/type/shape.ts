import { isObject, isString, keysOf, safeJsonParse, Infer, TypeOf } from '@benzed/util'

import { TypeValidatorSettings, ValidatorContext } from '../../../validator'
import { AnySchematic } from '../../schematic'
import Type from './type'

//// Types //// 

type ShapeInput = {
    [key: string | number | symbol]: AnySchematic
}

type ShapeOutput<T extends ShapeInput> = Infer<{
    [K in keyof T]: TypeOf<T[K]>
}, object>

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