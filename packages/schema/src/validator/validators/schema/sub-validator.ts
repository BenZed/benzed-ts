
import { ValidatorStruct } from '../../validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Sub Validator Types ////

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
