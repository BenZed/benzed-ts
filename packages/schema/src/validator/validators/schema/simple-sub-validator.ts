import { $$assign, StructAssignState } from '@benzed/immutable'
import { 
    isBoolean, 
    isFunc, 
    isOneOf, 
    isOptional, 
    isString, 
    SignatureParser 
} from '@benzed/util'

import { 
    ContractValidatorSettings 
} from '../../contract-validator'
import { $$state, ValidatorStruct } from '../../validator-struct'

import { 
    SubValidator, 
    SubValidatorConfigure 
} from './sub-validator'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Helper ////

// TODO move me

type MessageMethod<I> = ValidatorStruct<I,any>['message']

const toEnabledError = new SignatureParser({
    enabled: isOptional(isBoolean),
    message: isOptional(isOneOf(isString, isFunc<MessageMethod<unknown>>))
}).setDefaults({
    enabled: true
}).addLayout('enabled', 'message')
    .addLayout('message')

type EnabledErrorSignature = Parameters<typeof toEnabledError>

//// Main ////

type SimpleSubValidatorState<T> = { enabled: boolean, message: string | MessageMethod<T> }
/**
 * Convenience class for sub validators that only take
 * an error as configuration
 */
abstract class SimpleSubValidator<T> extends SubValidator<T>
    implements SubValidatorConfigure<T, SimpleSubValidatorState<T>> {

    constructor(
        readonly enabled: boolean, 
        message: string | MessageMethod<T>
    ) {
        super()
        this._applyMessage(message)
    }

    configure(
        ...args: EnabledErrorSignature
    ): SimpleSubValidatorState<T> {
        return toEnabledError(...args) as SimpleSubValidatorState<T>
    }

    get [$$state](): SimpleSubValidatorState<T> {
        const { enabled, message } = this 
        return { enabled, message }
    }

    override [$$assign](state: StructAssignState<this>): StructAssignState<this> {
        
        const { enabled } = state 

        if (state.message)
            this._applyMessage(state.message)

        return { enabled } as unknown as StructAssignState<this>

    }

    private _applyMessage(msg: string | MessageMethod<T>): void {
        this.message = isString(msg) ? () => msg : msg
    }

}

//// Exports ////

export default SimpleSubValidator

export {
    SimpleSubValidator,
    EnabledErrorSignature,
    toEnabledError,
    MessageMethod
}