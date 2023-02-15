import { ValidateOutput } from '../../validate'
import { ValidatorProxy } from '../validator-proxy'
import { LastValidator, ValidatorArray } from './transform-validator'

//// HelperTypes ////

type _UnionValidatorWrapBuilderOutput<V extends ValidatorArray, P> = 
    P extends V
        ? UnionValidator<V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => UnionValidator<V> 
            : P

type _UnionValidatorProperties<V extends ValidatorArray> = {
    [K in keyof V]: _UnionValidatorWrapBuilderOutput<V, V[K]>
}

//// Types ////

type UnionValidator<V extends ValidatorArray> = 
    ValidatorProxy<LastValidator<V>, ValidateOutput<V[number]>> 
    & _UnionValidatorProperties<V>

interface UnionValidatorConstructor {
    new <V extends ValidatorArray>(...validators: V): UnionValidator<V>
}

//// Main ////

const UnionValidator = class UnionValidator extends ValidatorProxy<LastValidator<ValidatorArray>, ValidateOutput<ValidatorArray[number]>> {
    
} as unknown as UnionValidatorConstructor

//// Exports ////

export default UnionValidator

export {
    UnionValidator
}
