import { isFunc, isPrimitive, Primitive } from '@benzed/util'

import { 
    AnySchematic, 
    
    InstanceInput,
    Instance,
    Value,
    Schematic,
} from '../../schema'
import { Is, IsRef } from '../is'

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

type _ResolveSchematics<T extends ResolveSchematicsInput> = T extends [infer T1, ...infer Tr]
    ? T1 extends ResolveSchematicInput
        ? Tr extends ResolveSchematicsInput 
            ? [ResolveSchematicOutput<T1>, ..._ResolveSchematics<Tr>]
            : [ResolveSchematicOutput<T1>]
        : never
    : []

//// Types ////

type ResolveSchematicsInput = ResolveSchematicInput[]
type ResolveSchematicsOutput<T extends ResolveSchematicsInput> = _ResolveSchematics<T>

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
