import { TypesOf } from '@benzed/util'

import Schema from '../../schema'

import ChainableSchema from '../chainable-schema'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type IsUnionFlatten<S extends Schema> = S extends IsUnion<infer Sx> 
    ? Sx
    : [S]

type IsUnionInput = Schema[]

//// IsUnion ////

class IsUnion<S extends IsUnionInput> extends ChainableSchema<TypesOf<S>[number]>{

    static flatten<Sx extends Schema>(schema: Sx): IsUnionFlatten<Sx> {
        return (schema instanceof IsUnion
            ? schema.types
            : [schema]
        ) as IsUnionFlatten<Sx>
    }

    readonly types: S

    constructor(...types: S) {

        type O = TypesOf<S>[number]

        super((i, options): O => {
            const schemas = this.types as IsUnionInput
    
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

//// Exports ////

export default IsUnion

export {
    IsUnion,
    IsUnionInput,
    IsUnionFlatten
}