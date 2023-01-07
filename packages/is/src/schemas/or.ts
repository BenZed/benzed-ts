import { Callable, Infer, TypesOf } from '@benzed/util'

import Schema, { Schemas } from '../schema/schema'

import IsBoolean from './boolean'
import IsNumber from './number'
import ChainableSchema from './chainable-schema'

import { IsString } from './string'
import { IsInstanceInput, IsInstance, schemaFrom } from '../schema/schema-from'
import IsEnum, { IsEnumInput } from './enum'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type FlattenUnion<S extends Schema> = S extends IsUnion<infer Sx> 
    ? Schemas<Sx>
    : [S]

interface IsUnionFrom<S extends Schema> {
    <T extends IsInstanceInput>(type: T): ToIsUnion<S, IsInstance<T>>
    <T extends IsEnumInput>(...options: T): ToIsUnion<S, IsEnum<T>>
    <T extends Schema>(schema: T): ToIsUnion<S, T>
    // tuple shortcut 
    // shape shortcut
}

//// ToIsUnion ////

type ToIsUnion<S extends Schema, T extends Schema> = 
    Infer<IsUnion<TypesOf<[...FlattenUnion<S>, ...FlattenUnion<T>]>>>

class IsUnion<T extends unknown[]> extends ChainableSchema<T[number]>{

    static flatten<S extends Schema>(schema: S): FlattenUnion<S> {
        return (schema instanceof IsUnion
            ? schema.types
            : [schema]
        ) as FlattenUnion<S>
    }

    readonly types: Schemas<T>

    constructor(...types: Schemas<T>) {
        super((i, options) => {
            const schemas = this.types as Schema<unknown>[]
    
            for (const schema of this.types as Schema[]) {
                if (schema.is(i))
                    return i
            }

            const errors: Error[] = []
            for (const schema of schemas) {
                try {
                    return schema.validate(i, options)
                } catch (e) {
                    errors.push(e as Error)
                }
            }

            // TODO validationErrors need to support arrays and maps of errors
            throw new Error(`Multiple Or Schema Errors: ${errors.map(e => e.message)}`)
        })
        this.types = types
    }
}

//// Or ////

class Or<S extends Schema> extends Callable<IsUnionFrom<S>> {

    constructor(readonly from: S) {
        super((...args: Parameters<IsUnionFrom<S>>) => 
            this._toIsUnion(schemaFrom(...args)) as any
        )
    }

    //// Chain ////
    
    get boolean(): ToIsUnion<S, IsBoolean> {
        return this._toIsUnion(new IsBoolean)
    }

    get string(): ToIsUnion<S, IsString> {
        return this._toIsUnion(new IsString)
    }

    get number(): ToIsUnion<S, IsNumber> {
        return this._toIsUnion(new IsNumber)
    }

    //// Helper ////
    
    private _toIsUnion<T extends Schema>(to: T): ToIsUnion<S, T> {

        type Types = TypesOf<[...FlattenUnion<S>, ...FlattenUnion<T>]>

        const schemas = [
            ...IsUnion.flatten(this.from),
            ...IsUnion.flatten(to)
        ] as Schema<unknown>[] as Schemas<Types>

        return new IsUnion(...schemas)
    }
    
}

//// Exports ////

export default Or

export {
    Or,
    IsUnion
}