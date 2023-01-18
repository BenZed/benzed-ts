import { OutputOf, TypeGuard, TypeOf } from '@benzed/util'
import { ResolveSchematicsOutput } from '../../../../is/to/resolve-schematics'
import Schematic, { AnySchematic } from '../../../schematic'

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

class Tuple<T extends TupleInput> extends Schematic<TupleOutput<T>> {
    
}