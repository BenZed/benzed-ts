import { Struct, StructState } from '@benzed/immutable'
import { 
    isBoolean, 
    isFunc, 
    isOneOf, 
    isOptional, 
    isString, 
    SignatureParser 
} from '@benzed/util'

import { $$state, ValidatorState, ValidatorStruct } from '../../validator-struct'

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

type SimpleSubValidatorState<T> = { enabled: boolean, message: MessageMethod<T> }
/**
 * Convenience class for sub validators that only take
 * an error as configuration
 */
abstract class SimpleSubValidator<T> 
    extends SubValidator<T> 
    implements ValidatorState<SimpleSubValidatorState<T>> {

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
        const { enabled, message } = toEnabledError(...args)
        const next = Struct.applyState(this, { enabled } as StructState<this>)

        if (message)
            next._applyMessage(message)

        return next
    }

    get [$$state](): SimpleSubValidatorState<T> {
        const { enabled, message } = this 
        return { enabled, message }
    }

    private _applyMessage(message: string | MessageMethod<T>): void {
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