// import { Primitive, TypeGuard } from '@benzed/util'

import { 
    AnySchematic, 
    // Value,
} from '../schema'

import { Or } from '../schema/schemas/mutator/_old-pre-mutator/or'

import resolveSchematic from './resolve-schematics'

// import { ResolveSchematicsOutput } from './resolve'

//// Helper Types ////

// type _UniqueValues<T extends Primitive[], V extends Primitive> = T extends [infer T1, ...infer Tr]
//     ? T1 extends V
//         ? [T1, ...Tr]
//         : Tr extends Primitive[] 
//             ? [T1, ..._UniqueValues<Tr, V>]
//             : T
//     : [V]

// type _MergeSchematics<T extends ReduceSchematicsInput, V extends Primitive[] = []> = T extends [infer T1, ...infer Tr]
//     ? Tr['length'] extends 0
//         ? T1 extends Value<infer Vx> 
//             ? ResolveSchematicsOutput<_UniqueValues<V, Vx>>
//             : [T1, ...ResolveSchematicsOutput<V>]
//         : T1 extends Value<infer Vx> 
//             ? _MergeSchematics<Tr, _UniqueValues<V, Vx>>
//             : [T1, ..._MergeSchematics<Tr, V>]
//     : []

type _FlattenSchematics<T extends ReduceSchematicsInput> = T extends [infer T1, ...infer Tr]
    ? T1 extends Or<infer Tx>  
        ? Tx extends ReduceSchematicsInput 
            ? Tr extends ReduceSchematicsInput 
                ? _FlattenSchematics<[...Tx, ...Tr]>
                : never
            : never
        : Tr extends ReduceSchematicsInput 
            ? [T1, ..._FlattenSchematics<Tr>]
            : [T1] 
    : []

type _ReduceSchematics<T extends ReduceSchematicsInput> = _FlattenSchematics<T> // _FlattenSchematics<_MergeSchematics<T>>

//// Types ////

type ReduceSchematicsInput = AnySchematic[]
type ReduceSchematicsOutput<T extends ReduceSchematicsInput> = 
    _ReduceSchematics<T> extends infer Tx
        ? Tx extends AnySchematic[] 
            ? Tx['length'] extends 1
                ? Tx[0] 
                : Or<Tx>
            : never 
        : never 

//// Redce Methods ////

function reduceSchematics<T extends AnySchematic[]>(
    ...inputs: T
): ReduceSchematicsOutput<T> {

    const schematics: AnySchematic[] = []

    // const isValueSchematic = Value[Symbol.hasInstance].bind(Value) as TypeGuard<Value<Primitive>>

    // const isUnique = (t1: AnySchematic): boolean => 
    //     !isValueSchematic(t1) ||
    //     !schematics.filter(isValueSchematic).some(t1.equals)

    for (const input of inputs) {

        const schematic = resolveSchematic(input) as AnySchematic

        const flattened = schematic instanceof Or
            ? (schematic as Or<AnySchematic[]>).types as AnySchematic[] 
            : [schematic]

        schematics.push(...flattened)
        // const unique = flattened.filter(isUnique)
        // schematics.push(...unique)
    }

    const schematic = schematics.length === 1 
        ? schematics[0] 
        : new Or(...schematics)

    return schematic as ReduceSchematicsOutput<T>
}

//// Exports ////

export default resolveSchematic

export {

    reduceSchematics,
    ReduceSchematicsInput,
    ReduceSchematicsOutput,
}
