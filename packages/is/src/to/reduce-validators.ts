
import { Or, Validator } from '@benzed/schema'
import resolveValidator from './resolve-validators'

// import { ResolveValidatorOutput } from './resolve'

//// Helper Types ////

type _FlattenValidator<T extends ReduceValidatorInput> = T extends [infer T1, ...infer Tr]
    ? T1 extends Or<infer Tx>  
        ? Tx extends ReduceValidatorInput 
            ? Tr extends ReduceValidatorInput 
                ? _FlattenValidator<[...Tx, ...Tr]>
                : never
            : never
        : Tr extends ReduceValidatorInput 
            ? [T1, ..._FlattenValidator<Tr>]
            : [T1] 
    : []

type _ReduceValidator<T extends ReduceValidatorInput> = _FlattenValidator<T> 

//// Types ////

type ReduceValidatorInput = Validator[]
type ReduceValidatorOutput<T extends ReduceValidatorInput> = 
    _ReduceValidator<T> extends infer Tx
        ? Tx extends Validator[] 
            ? Tx['length'] extends 1
                ? Tx[0] 
                : Or<Tx>
            : never 
        : never 

//// Redce Methods ////

function reduceValidators<T extends Validator[]>(
    ...inputs: T
): ReduceValidatorOutput<T> {

    const validators: Validator[] = []

    for (const input of inputs) {

        const schematic = resolveValidator(input) as Validator

        const flattened = schematic instanceof Or
            ? (schematic as Or<Validator[]>).validators as Validator[] 
            : [schematic]

        validators.push(...flattened)
    }

    const schematic = validators.length === 1 
        ? validators[0] 
        : new Or(...validators)

    return schematic as ReduceValidatorOutput<T>
}

//// Exports ////

export default resolveValidator

export {

    reduceValidators,
    ReduceValidatorInput,
    ReduceValidatorOutput,
}
