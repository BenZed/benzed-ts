import { InstanceValidatorInput, Or, Validator } from '@benzed/schema'
import { Infer, isFunc, isPrimitive, Primitive } from '@benzed/util'
import { Value, Instance } from '../schemas'

//// Helper Types ////

type ResolveValidatorInput = 
    Primitive |
    InstanceValidatorInput | 
    Validator // | ShapeInput | TupleInput | TypeValidator

type ResolveValidatorOutput<T extends ResolveValidatorInput> = 
    T extends Primitive 
        ? Value<T>
        : T extends InstanceValidatorInput 
            ? Instance<T>
            : T

type _ResolveValidators<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    ? T1 extends Or<infer Tx> 
        ? [...Tx, ..._ResolveValidators<Tr>]
        : T1 extends ResolveValidatorInput
            ? [ResolveValidatorOutput<T1>, ..._ResolveValidators<Tr>]
            : never
    : []

//// Types ////

type ResolveValidatorsInput = ResolveValidatorInput[]
type ResolveValidatorsOutput<T extends ResolveValidatorsInput> = Infer<_ResolveValidators<T>, Validator[]>

//// Methods ////

function resolveValidator<T extends ResolveValidatorInput>(
    input: T
): ResolveValidatorOutput<T> {

    if (isPrimitive(input))
        return new Value(input) as ResolveValidatorOutput<T>

    // TODO check for shape and tuple
    if (!isFunc(input))
        throw new Error('Input invalid.')

    return (input instanceof Validator
        ? input 
        : new Instance(input)
    ) as ResolveValidatorOutput<T>
}

function resolveValidators<T extends ResolveValidatorsInput>(...input: T): ResolveValidatorsOutput<T> {
    return input.map(resolveValidator) as ResolveValidatorsOutput<T>
}

//// Exports ////

export default resolveValidator

export {

    resolveValidator,
    ResolveValidatorInput,
    ResolveValidatorOutput,
    
    resolveValidators,
    ResolveValidatorsInput,
    ResolveValidatorsOutput,

}
