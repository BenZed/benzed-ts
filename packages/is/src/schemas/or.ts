import { Callable } from '@benzed/util'
import Schema from '../schema/schema'
import BooleanSchema from './boolean'

////  ////

// // Move me
// class Schemata<A extends unknown[], S extends Schema> extends Callable<(...args: A) => S> {

// }

//// Main ////

interface ToOrSchema<F extends Schema> {
    <T extends Schema>(to: T): OrSchema<[T,F]>
}

type TypeOf<S extends Schema> = S extends Schema<infer T> ? T : unknown 

type TypesOf<S extends Schema[]> = S extends [infer S1, ...infer Sr]
    ? S1 extends Schema<infer T1> 
        ? Sr extends Schema[]
            ? [T1, ...TypesOf<Sr>]
            : [T1]
        : Sr extends Schema[]
            ? TypesOf<Sr>
            : []
    : []

class OrSchema<S extends Schema[]> extends Schema<TypesOf<S>[number]>{

    schemas: S 

    constructor(...schemas: S) {
        super(() => {
            throw new Error('not yet implemented')
        })
        this.schemas = schemas
    }

}

class OrSchemata<F extends Schema> extends Callable<ToOrSchema<F>> {

    constructor(readonly fromSchema: F) {
        super(toSchema => new OrSchema(this.fromSchema, toSchema))
    }

    get boolean(): BooleanSchema {
        return new BooleanSchema()
    }
    
}

//// Exports ////

export default OrSchemata

export {
    OrSchemata
}