import { isArrayLike, TypeGuard } from '@benzed/util'
import { TypeValidatorSettings } from '../../../../validator'
import Schema from '../../../schema'
import Schematic, { AnySchematic } from '../../../schematic'
import Type from '../type'

////  ////

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

////  ////

class Tuple<T extends TupleInput> extends Type<TupleOutput<T>> {

    constructor(types: T) {
        super({

            name: 'tuple',

            types,

            is(input: unknown): input is TupleOutput<T> {
                return isArrayLike(input) && this.types.every((type, i) => type.is(input[i]))
            }

        } as TypeValidatorSettings<TupleOutput<T>> & { types: T })
    }

}