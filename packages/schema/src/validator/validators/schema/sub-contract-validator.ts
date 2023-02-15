import ContractValidator from '../../contract-validator'

//// Exports ////

export abstract class SubContractValidator<T> extends ContractValidator<T,T> {

    abstract get enabled(): boolean

}
