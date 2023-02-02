
import { ValidatorState, ValidatorStruct } from '../../validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Sub Validator Types ////

/**
 * An interface sub validators may implement to customize
 * it's own sub-setter configuration signature.
 */
export interface SubValidatorConfigure<T, S extends object> 
    extends SubValidator<T>, ValidatorState<S> {

    /**
     * May return any generic 
     */
    configure(...args: unknown[]): S

}

/**
 * A sub validator is an immutably configurable addition to a schema
 * that all
 */
export abstract class SubValidator<O> extends ValidatorStruct<O, O> {

    /**
     * SubValidators can be disabled.
     */
    abstract readonly enabled: boolean

}
