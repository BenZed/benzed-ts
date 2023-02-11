import ContractValidator from '../../contract-validator'
import { ValidatorStruct } from '../../validator-struct'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

export interface SubValidator<O> extends ValidatorStruct<O,O> {
    readonly enabled: boolean
}

export type AnySubValidator = SubValidator<any>

//// Main ////

abstract class SubContractValidator<T> extends ContractValidator<T,T> {

    abstract get enabled(): boolean

}

//// Exports ////

export default SubContractValidator

export {
    SubContractValidator
}