
import { Validator, Or, ReadOnly } from '@benzed/schema'
import { each, Infer, isFunc, isPrimitive, isRecord, Primitive } from '@benzed/util'

import { Is, IsCursor } from '../is'
import { Value, InstanceOf, InstanceInput, Shape, ShapeInput } from '../schemas'

//// Helper Types ////

type _ReduceValidators<T extends Validator[]> = T['length'] extends 1
    ? T[0]
    : Or<T>

//// Types ////

 type ResolveValidatorInput =
    | IsCursor<Validator>
    | Primitive 
    | ResolveShapeValidatorInput 
    | Validator 
    | InstanceInput 

type ResolveShapeValidatorInput = { [key: PropertyKey]: ResolveValidatorInput }

type ResolveValidatorsInput = ResolveValidatorInput[]

type ResolveValidator<T extends ResolveValidatorsInput> = 
    Infer<_ReduceValidators<ResolveValidators<T>>, Validator>

type ResolveValidators<T extends unknown[]> = T extends [infer T1, ...infer Tr]
    // Handle IS
    ? T1 extends IsCursor<infer Tx> 
        ? [
            ...ResolveValidators<[Tx]>,
            ...ResolveValidators<Tr>
        ]

        // Handle Or
        : T1 extends Or<infer Tx> 
            ? [
                ...ResolveValidators<Tx>, 
                ...ResolveValidators<Tr>
            ]
            : [
                // Handle Primitive
                T1 extends Primitive 
                    ? Value<T1>

                    // Handle Shape
                    : T1 extends ResolveShapeValidatorInput 
                        ? Shape<{
                            [K in keyof T1]: ResolveValidator<[T1[K]]>
                        }>

                        // Handle Validator
                        : T1 extends Validator
                            ? T1

                            // Handle Instance
                            : T1 extends InstanceInput
                                ? InstanceOf<InstanceType<T1>>

                                // Failure
                                : never,
                ...ResolveValidators<Tr>
            ]
    : []

//// Main ////

function resolveValidators<T extends ResolveValidatorsInput>(
    ...inputs: T
): ResolveValidators<T> {
    return inputs.flatMap(input => {

        // Handle Is
        if (Is.is(input))
            return resolveValidators(input.validate)

        // Handle Or
        if (input instanceof Or<Validator[]>)
            return resolveValidators(...input.validators)

        // Handle Primitive 
        if (isPrimitive(input))
            return new ReadOnly(new Value(input))

        // Handle Shape
        if (isRecord(input)) {
            const shape = { ...input }
            for (const key of each.keyOf(shape))
                shape[key] = resolveValidator(input[key])
            return new Shape(shape as ShapeInput)
        }

        // Handle Validator
        if (Validator.is(input))
            return input

        // Handle Instance
        if (isFunc(input))
            return new InstanceOf(input as InstanceInput)

        // Failure
        throw new Error(`${input} is invalid`)

    }) as ResolveValidators<T>
}

function resolveValidator<T extends ResolveValidatorsInput>(
    ...inputs: T
): ResolveValidator<T> {

    const validators = resolveValidators(...inputs) as Validator[]
    if (validators.length === 0)
        throw new Error('input required')

    // Reduce
    return (
        validators.length === 1
            ? validators[0]
            : new Or(...validators)
    ) as ResolveValidator<T>
}

//// Exports ////

export default resolveValidator

export {
    resolveValidator,
    ResolveValidator,

    resolveValidators,
    ResolveValidators,

    ResolveValidatorInput,
    ResolveValidatorsInput,
    ResolveShapeValidatorInput
}