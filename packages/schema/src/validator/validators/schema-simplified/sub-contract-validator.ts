import ValidationContext from '../../../validation-context'
import ContractValidator from '../../contract-validator'

//// Exports ////

export abstract class SubContractValidator<T> extends ContractValidator<T,T> {

    abstract get enabled(): boolean

    abstract message: string | ((ctx: ValidationContext<T>) => string) 

}
