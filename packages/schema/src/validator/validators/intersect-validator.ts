import { Intersect } from '@benzed/util'
import { ValidateOutput } from '../../validate'
import { AnyValidateStruct } from '../validate-struct'
import { ValidatorProxy } from '../validator-proxy'
import { LastValidator, ValidatorArray } from './transform-validator'

//// HelperTypes ////

type _IntersectionValidatorWrapBuilderOutput<V extends ValidatorArray, P> = 
    P extends V
        ? IntersectionValidator<V>
        : P extends (...args: infer A) => V 
            ? (...args: A) => IntersectionValidator<V> 
            : P

type _IntersectionValidatorProperties<V extends ValidatorArray> = {
    [K in keyof V]: _IntersectionValidatorWrapBuilderOutput<V, V[K]>
}

//// Types ////

type ValidateArrayOutput<T extends ValidatorArray> = T extends [infer T1, ...infer Tr]
    ? T1 extends AnyValidateStruct
        ? Tr extends ValidatorArray
            ? [ValidateOutput<T1>, ...ValidateArrayOutput<Tr>]
            : [ValidateOutput<T1>]
        : []
    : []

type IntersectionOutput<V extends ValidatorArray> = Intersect<ValidateArrayOutput<V>>

type IntersectionValidator<V extends ValidatorArray> = 
    ValidatorProxy<LastValidator<V>, IntersectionOutput<V>> 
    & _IntersectionValidatorProperties<V>

interface IntersectionValidatorConstructor {
    new <V extends ValidatorArray>(...validators: V): IntersectionOutput<V>
}

//// Main ////

const IntersectionValidator = class IntersectionValidator 
    extends ValidatorProxy<LastValidator<ValidatorArray>, ValidateOutput<ValidatorArray[number]>> {
    
} as unknown as IntersectionValidatorConstructor

//// Exports ////

export default IntersectionValidator

export {
    IntersectionValidator
}
