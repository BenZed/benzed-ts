import { Callable, Infer, TypesOf } from '@benzed/util'

import Schema from '../schema'

import {
    IsBoolean, 
    IsNumber, 
    IsString, 
    IsEnum, 
    IsEnumInput
} from './is-type'

import ChainableSchema from './chainable-schema'

import { IsInstanceInput, IsInstance, schemaFrom } from '../schema-from'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type FlattenUnion<S extends Schema> = S extends IsUnion<infer Sx> 
    ? Sx
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
    Infer<IsUnion<[...FlattenUnion<S>, ...FlattenUnion<T>]>>

class IsUnion<S extends Schema[]> extends ChainableSchema<TypesOf<S>[number]>{

    static flatten<Sx extends Schema>(schema: Sx): FlattenUnion<Sx> {
        return (schema instanceof IsUnion
            ? schema.types
            : [schema]
        ) as FlattenUnion<Sx>
    }

    readonly types: S

    constructor(...types: S) {

        type O = TypesOf<S>[number]

        super((i, options): O => {
            const schemas = this.types as Schema<unknown>[]
    
            for (const schema of schemas) {
                if (schema.is(i))
                    return i as O
            }

            const errors: Error[] = []
            for (const schema of schemas) {
                try {
                    return schema.validate(i, options) as O
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

        const types = [
            ...IsUnion.flatten(this.from),
            ...IsUnion.flatten(to)
        ] as [...FlattenUnion<S>, ...FlattenUnion<T>]

        return new IsUnion(...types)
    }
    
}

//// Exports ////

export default Or

export {
    Or,
    IsUnion
}