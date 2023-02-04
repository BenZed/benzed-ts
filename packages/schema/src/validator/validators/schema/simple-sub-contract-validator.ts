import { Property } from '@benzed/util'

import { SimpleSubValidator, MessageMethod, EnabledErrorSignature } from './simple-sub-validator'
import { ContractValidator } from '../../contract-validator'
import { $$state } from '@benzed/immutable/src'

//// Main ////

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
    }

    override get name(): string {
        return this.constructor.name
    }

    configure = SimpleSubValidator.prototype.configure as unknown as (...args: EnabledErrorSignature) => this

    //// Helper ////

    protected _applyMessage = SimpleSubValidator.prototype['_applyMessage']

}

//// Mixin ////

{
    const { define, descriptorOf } = Property
    define(
        SimpleSubContractValidator.prototype, 
        {  
            configure: descriptorOf(SimpleSubValidator.prototype, 'configure') as PropertyDescriptor,
            _applyMessage: descriptorOf(SimpleSubValidator.prototype, '_applyMessage') as PropertyDescriptor,
            [$$state]: descriptorOf(SimpleSubValidator.prototype, $$state) as PropertyDescriptor,
        }
    )
}
