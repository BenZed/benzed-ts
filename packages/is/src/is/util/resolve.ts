import { CallableStruct } from '@benzed/immutable'
import { Infer, isFunc, isPrimitive, Primitive, TypeGuard } from '@benzed/util'

import { 
    AnySchematic, 
    
    InstanceInput,
    Instance,
    Value,
    Schematic,
} from '../../schema'

import { Or } from '../or'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
    @typescript-eslint/ban-types,
    @typescript-eslint/no-var-requires
*/

//// Helper Types ////

// type _UniqueValues<T extends unknown[], V extends Primitive> = T extends [infer T1, ...infer Tr]
//     ? T1 extends V
//         ? [T1, ...Tr]
//         : Tr extends [] 
//             ? [...T, V]
//             : [T1, ..._UniqueValues<Tr, V>]
//     : [V]

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

// type _MergeSchematics<T extends unknown[], V extends Primitive[] = []> = T extends [infer T1, ...infer Tr]
//     ? Tr['length'] extends 0
//         ? T1 extends Value<infer Vx> 
//             ? _ResolveSchematics<_UniqueValues<V, Vx>>
//             : [T1, ..._ResolveSchematics<V>]
//         : T1 extends Value<infer Vx> 
//             ? _MergeSchematics<Tr, _UniqueValues<V, Vx>>
//             : [T1, ..._MergeSchematics<Tr, V>]
//     : []

//// Types ////

type ResolveSchematicInput = 
    Primitive |
    InstanceInput | 
    AnySchematic // | ShapeInput | TupleInput | TypeValidator

type ResolveSchematicOutput<T extends ResolveSchematicInput> = 
    T extends Primitive 
        ? Value<T>
        : T extends InstanceInput 
            ? Instance<T>
            : T

type _ResolveSchematics<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Or<infer Tx> 
        ? [...Tx, ..._ResolveSchematics<Tr>]
        : T1 extends ResolveSchematicInput
            ? [ResolveSchematicOutput<T1>, ..._ResolveSchematics<Tr>]
            : never
    : []

type ResolveSchematicsInput = ResolveSchematicInput[]
type ResolveSchematicsOutput<T extends ResolveSchematicsInput> = 
    Infer<_ResolveSchematics<T>, AnySchematic[]>

type ReduceSchematicsInput = AnySchematic[]
type ReduceSchematicsOutput<T extends ReduceSchematicsInput> = 
    _FlattenSchematics<T> extends infer Tx
        ? Tx extends AnySchematic[] 
            ? Tx['length'] extends 1
                ? Tx[0] 
                : Or<Tx>
            : never 
        : never 

//// Resolve Methods ////

function resolveSchematic<T extends ResolveSchematicInput>(
    input: T
): ResolveSchematicOutput<T> {

    if (isPrimitive(input))
        return new Value(input) as ResolveSchematicOutput<T>

    // TODO check for shape and tuple

    if (!isFunc(input))
        throw new Error('Input invalid.')

    return (Schematic.is(input) 
        ? input 
        : new Instance(input)) as ResolveSchematicOutput<T>
}

function resolveSchematics<T extends ResolveSchematicsInput>(
    ...input: T
): ResolveSchematicsOutput<T> {
    return input.map(resolveSchematic) as ResolveSchematicsOutput<T>
}

function reduceSchematics<T extends AnySchematic[]>(
    ...inputs: T
): ReduceSchematicsOutput<T> {

    const schematics: AnySchematic[] = []

    const isValueSchematic = Value[Symbol.hasInstance].bind(Value) as TypeGuard<Value<Primitive>>

    const isUnique = (t1: AnySchematic): boolean => 
        !isValueSchematic(t1) ||
        !schematics.filter(isValueSchematic).some(t1.equals)

    for (const input of inputs) {

        const schematic = resolveSchematic(input) as AnySchematic

        const flattened = schematic instanceof Or
            ? schematic.types as AnySchematic[] 
            : [schematic]

        const unique = flattened.filter(isUnique)

        schematics.push(...unique)
    }

    const schematic = schematics.length === 1 
        ? schematics[0] 
        : new Or(...schematics)

    return schematic as ReduceSchematicsOutput<T>
}

/**
 * @internal
 */
interface ResolveSchematicMap {

    get string(): AnySchematic
    get boolean(): AnySchematic
    get number(): AnySchematic
    // get integer(): AnySchematic

    // get primitive(): AnySchematic
    // get defined(): AnySchematic
    // get bigint(): AnySchematic
    // get symbol(): AnySchematic

    // get null(): AnySchematic
    // get nil(): AnySchematic
    // get nan(): AnySchematic
    // get undefined(): AnySchematic

    // get iterable(): AnySchematic  
    get array(): AnySchematic
    // get map(): AnySchematic
    // get set(): AnySchematic

    // get record(): AnySchematic
    // get object(): AnySchematic
    // get function(): AnySchematic

    // get date(): AnySchematic
    // get promise(): AnySchematic
    // get regexp(): AnySchematic
    // get error(): AnySchematic
    // get weakMap(): AnySchematic
    // get weakSet(): AnySchematic

    // tuple<T extends TupleInput>(...types: T): AnySchematic
    // shape<T extends ShapeInput>(shape: T): AnySchematic
    // instanceOf<T extends InstanceInput>(type: T): AnySchematic
    // typeOf<T>(of: TypeGuard<T> | TypeValidatorSettings<T>): AnySchematic
}

const ResolveSchematic = CallableStruct

//// Exports ////

export default resolveSchematic

export {
    ResolveSchematic,
    ResolveSchematicMap,

    resolveSchematic,
    ResolveSchematicInput,
    ResolveSchematicOutput,
    
    resolveSchematics,
    ResolveSchematicsInput,
    ResolveSchematicsOutput,

    reduceSchematics,
    ReduceSchematicsInput,
    ReduceSchematicsOutput,
}
