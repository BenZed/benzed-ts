import { $$state, Struct, StructState, StructStateLogic } from '@benzed/immutable'
import { 
    assign,
    isBoolean, 
    isFunc, 
    isOneOf, 
    isOptional, 
    isString, 
    pick, 
    SignatureParser 
} from '@benzed/util'

import { ValidatorStruct } from '../../validator-struct'

import { 
    SubValidator, 
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
abstract class SimpleSubValidator<T> 
    extends SubValidator<T> 
    implements StructStateLogic<SimpleSubValidatorState<T>> {

    constructor(
        readonly enabled: boolean, 
        message: string | MessageMethod<T>
    ) {
        super()
        this._applyMessage(message)
    }

    configure(
        ...args: EnabledErrorSignature
    ): this {
        const newState = toEnabledError(...args) as StructState<this>
        const newStruct = Struct.applyState(this, newState)
        return newStruct
    }

    // State  

    get [$$state](): SimpleSubValidatorState<T> {
        return pick(this, 'enabled', 'message')
    }  

    set [$$state](state: SimpleSubValidatorState<T>) {
        const { enabled, message } = state
        
        assign(this, { enabled })
        this._applyMessage(message)
    } 

    // Helper

    protected _applyMessage(message: string | MessageMethod<T>): void {
        this.message = isString(message) ? () => message : message
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