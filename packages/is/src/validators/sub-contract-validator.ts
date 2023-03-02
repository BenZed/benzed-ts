import { ContractValidator, SubValidator, Validator } from '@benzed/schema/src'
import { define, pick } from '@benzed/util/src'

//// Main ////

abstract class SubContractValidator<T> extends ContractValidator<T> implements SubValidator<T>{

    readonly enabled: boolean = false

    get [Validator.state](): Pick<this, 'enabled' | 'name' | 'message'> {
        return pick(this, 'enabled', 'name', 'message')
    }

    set [Validator.state](state: Pick<this, 'enabled' | 'name' | 'message'>) {
        define.named(state.name, this)
        define.hidden(this, 'message', state.message)
        define.enumerable(this, 'enabled', state.enabled)
    }

}

//// Exports ////

export default SubContractValidator

export {
    SubContractValidator
}