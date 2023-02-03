import { isString, pick, Property } from '@benzed/util'

import { SimpleSubValidator, MessageMethod, EnabledErrorSignature, toEnabledError } from './simple-sub-validator'
import { ContractValidator } from '../../contract-validator'
import { $$state } from '../../validator-struct'
import { Struct, StructState } from '@benzed/immutable'

//// Main ////

type SimpleSubContractValidatorState<T> = { enabled: boolean, message: string | MessageMethod<T>}

/**
 * Convenience class for creating contract sub validators that only take
 * an error as configuration
 */
export abstract class SimpleSubContractValidator<T> extends ContractValidator<T, T> {

    constructor(
        readonly enabled: boolean,
        error: string | MessageMethod<T> = 'Validation failed.'
    ) {
        super()
        // mix-in configurer
        this._applyMessage(error)
        this._applyConfigurer()
    }

    override get name(): string {
        return this.constructor.name
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

    get [$$state](): SimpleSubContractValidatorState<T> {
        return pick(this, 'message', 'enabled') as SimpleSubContractValidatorState<T>
    }

    //// Helper ////

    private _applyMessage(error: string | MessageMethod<T>): void {

        const errorMethod = isString(error) ? () => error : error

        Property.configure(
            this,
            'error',
            {
                value: errorMethod
            }
        )
    }

    private _applyConfigurer(): void {
        Property.define(
            this, 
            'configure', 
            {
                value: SimpleSubValidator.prototype.configure,
                enumerable: false,
                writable: true,
                configurable: true
            }
        )
    }

}