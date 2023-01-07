import { Callable, Infer } from '@benzed/util'

import Schema, { Schemas, TypeOf, TypesOf } from '../schema/schema'

import BooleanSchema from './boolean'
import NumberSchema from './number'
import ChainableSchema from './chainable-schema'

import { StringSchema } from './string'

////  ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Main ////

interface ChainOrSchema<S extends Schema> {
    <T extends Schema>(to: T): ToOrSchema<S, T>
}

type ToOrSchema<S extends Schema, T extends Schema> = 
    Infer<OrSchema<TypesOf<[...FlattenOrSchema<S>, T]>>>

type FlattenOrSchema<S extends Schema> = S extends OrSchema<infer Sx> 
    ? Schemas<Sx>
    : [S]

class OrSchema<T extends unknown[]> extends ChainableSchema<T[number]>{

    static flatten<S extends Schema>(schema: S): FlattenOrSchema<S> {
        return (schema instanceof OrSchema
            ? schema.types
            : [schema]) as FlattenOrSchema<S>
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

class OrSchemata<S extends Schema> extends Callable<ChainOrSchema<S>> {

    constructor(readonly from: S) {
        super(to => this._toOrSchema(to))
    }

    get boolean(): ToOrSchema<S, BooleanSchema> {
        return this._toOrSchema(new BooleanSchema)
    }

    get string(): ToOrSchema<S, StringSchema> {
        return this._toOrSchema(new StringSchema)
    }

    get number(): ToOrSchema<S, NumberSchema> {
        return this._toOrSchema(new NumberSchema)
    }

    //// Helper ////
    
    private _toOrSchema<T extends Schema>(to: T): ToOrSchema<S, T> {

        type Types = TypesOf<[...FlattenOrSchema<S>, T]>

        const schemas = [
            ...OrSchema.flatten(this.from),
            to
        ] as Schema<unknown>[] as Schemas<Types>

        return new OrSchema(...schemas)
    }
    
}

//// Exports ////

export default OrSchemata

export {
    OrSchemata,
    OrSchema
}