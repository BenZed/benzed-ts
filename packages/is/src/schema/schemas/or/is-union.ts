import { TypesOf } from '@benzed/util'
import { AnyValidate, Validate } from '../../../validator'
import { AnySchematic } from '../../schematic'

import { ChainableSchematic } from '../chainable-schema'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type IsUnionFlatten<S extends AnyValidate> = S extends IsUnion<infer Sx> 
    ? Sx
    : [S]

type IsUnionInput = AnySchematic[]

//// IsUnion ////

class IsUnion<S extends IsUnionInput> 
    extends ChainableSchematic<TypesOf<S>[number]>{

    static flatten<V extends AnyValidate>(schema: V): IsUnionFlatten<V> {
        return (schema instanceof IsUnion
            ? schema.types
            : [schema]
        ) as IsUnionFlatten<V>
    }

    readonly types: S

    // protected override _copyWithValidators(...validators: Validate<unknown, unknown>[]): this {
    //     const clone = super._copyWithValidators(...validators);
    //     (clone as Mutable<{ types: S }>).types = this.types
    //     return clone
    // }

    constructor(...types: S) {

        type O = TypesOf<S>[number]

        const isUnion: Validate<unknown, O> = (i, options): O => {
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
        }

        super(isUnion)

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