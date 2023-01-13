import { TypesOf } from '@benzed/util'

import { AnySchematic } from '../../schematic'

import { ChainableSchematic } from '../chainable'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type IsUnionInput = readonly AnySchematic[]
type IsUnionOutput<T extends IsUnionInput> = TypesOf<T>[number]

//// IsUnion ////

class IsUnion<T extends IsUnionInput> extends ChainableSchematic<IsUnionOutput<T>> {

    readonly types: T

    constructor(...types: T) {

        type O = IsUnionOutput<T>

        super((i, options?): O => {
            const errors: unknown[] = []

            const types = this.types
            for (const type of types) {
                if (type.is(i))
                    return i
            }

            for (const type of this.types) {
                try {
                    return type.validate(i, options)
                } catch (e) {
                    errors.push(e)
                }
            }

            throw new AggregateError(errors)
        })
        
        this.types = types
    }
}
//// Exports ////

export default IsUnion

export {
    IsUnion,
    IsUnionInput
}