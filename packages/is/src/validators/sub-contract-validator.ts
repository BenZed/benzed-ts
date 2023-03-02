import { ContractValidator, SubValidator, Validator } from '@benzed/schema'
import { define, pick } from '@benzed/util'

//// Main ////

abstract class SubContractValidator<T> extends ContractValidator<T> implements SubValidator<T>{

    readonly enabled: boolean = false

    get [Validator.state](): Pick<this, 'enabled' | 'name' | 'message'> {
        return pick(this, 'enabled', 'name', 'message')
    }

}

//// Exports ////

export default SubContractValidator

export {
    SubContractValidator
}