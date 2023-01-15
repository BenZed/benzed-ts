import { TypesOf } from '@benzed/util'
import Schematic, { AnySchematic } from '../../schematic'

//// Eslint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type UnionInput = readonly AnySchematic[]
type UnionOutput<T extends UnionInput> = TypesOf<T>[number]

//// Union ////

class Union<T extends UnionInput> extends Schematic<UnionOutput<T>> {

    readonly types: T

    constructor(...types: T) {

        type O = UnionOutput<T>

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

export default Union

export {
    Union,
    UnionInput
}