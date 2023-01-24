import { isArrayLike, TypeGuard } from '@benzed/util'

import { TypeValidatorSettings, ValidateContext } from '../../../../schema/src/validator'
import { AnySchematic } from '../../schematic'
import { toArray } from '../type-of'
import Type from './type'

//// Types //// 

type TupleInput = readonly AnySchematic[]

type TupleOutput<T extends TupleInput> = T extends [infer T1, ...infer Tr]
    ? Tr extends TupleInput 
        ? T1 extends TypeGuard<infer O>
            ? [O, ...TupleOutput<Tr>]
            : [unknown, ...TupleOutput<Tr>]
        : T1 extends TypeGuard<infer O> 
            ? [O]
            : [unknown]
    : []

//// Tuple //// 

class Tuple<T extends TupleInput> extends Type<TupleOutput<T>> {

    get types(): T {
        return (this.typeValidator() as unknown as { types: T }).types
    }

    constructor(...types: T) {
        super({

            name: 'tuple',

            types,

            is(input: unknown): input is TupleOutput<T> {
                return isArrayLike(input) && this.types.every((type, i) => type.is(input[i]))
            },

            cast: toArray,

            transform(input: unknown, ctx: ValidateContext<unknown>): unknown {
                return isArrayLike(input)

                    ? this.types.map((type, i) => type.validate(
                        input[i], 
                        {
                            ...ctx,
                            value: input[i],
                            path: [...ctx.path, i ]
                        } as ValidateContext<unknown>))

                    : input 
            }

        } as TypeValidatorSettings<TupleOutput<T>> & { types: T })
    }
}

//// Exports ////

export default Tuple

export {
    Tuple,
    TupleInput,
    TupleOutput
}