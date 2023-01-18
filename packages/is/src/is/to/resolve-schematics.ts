import { Infer, isFunc, isPrimitive, Primitive } from '@benzed/util'

import { 
    AnySchematic, 
    
    InstanceInput,
    Instance,
    Value,
    Schematic,
} from '../../schema'
import { Is, IsRef } from '../is'

import { Or } from '../or'

//// Helper Types ////

type ResolveSchematicInput = 
    Primitive |
    InstanceInput | 
    AnySchematic // | ShapeInput | TupleInput | TypeValidator

type ResolveSchematicOutput<T extends ResolveSchematicInput> = 
    T extends Primitive 
        ? Value<T>
        : T extends InstanceInput 
            ? Instance<T>
            : T extends AnySchematic 
                ? IsRef<T>
                : never

type _ResolveSchematics<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Or<infer Tx> 
        ? [...Tx, ..._ResolveSchematics<Tr>]
        : T1 extends ResolveSchematicInput
            ? [ResolveSchematicOutput<T1>, ..._ResolveSchematics<Tr>]
            : never
    : []

//// Types ////

type ResolveSchematicsInput = ResolveSchematicInput[]
type ResolveSchematicsOutput<T extends ResolveSchematicsInput> = Infer<_ResolveSchematics<T>, AnySchematic[]>

//// Methods ////

function resolveSchematic<T extends ResolveSchematicInput>(
    input: T
): ResolveSchematicOutput<T> {

    if (input instanceof Is)
        input = input.ref as T

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

//// Exports ////

export default resolveSchematic

export {

    resolveSchematic,
    ResolveSchematicInput,
    ResolveSchematicOutput,
    
    resolveSchematics,
    ResolveSchematicsInput,
    ResolveSchematicsOutput,

}
