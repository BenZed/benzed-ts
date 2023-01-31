import { isString, Property } from '@benzed/util'
import { ValidateUpdateState } from '../../validate-struct'
import { ValidateErrorMethod } from './simple-sub-validator'
import { SubContractValidator } from './sub-contract-validator'
import { SubValidatorConfigure } from './sub-validator'

//// Main ////

/**
 * Convenience class for sub validators that only take
 * an error as configuration
 */
export abstract class SimpleSubContractValidator<T> extends SubContractValidator<T>
    implements SubValidatorConfigure<T> {

    constructor(
        readonly enabled: boolean,
        error: string | ValidateErrorMethod
    ) {
        super()

        // mix-in configurer

        this._applyError(error)
        this._applyConfigurer()
    }

    readonly configure!: SubValidatorConfigure<T>['configure']

    //// Helper ////
    
    private _applyError(error : string | ValidateErrorMethod): void {

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
                value: SimpleSubContractValidator.prototype.configure,
                enumerable: false,
                writable: true,
                configurable: true
            }
        )
    }

    // Update our state-assignment behaviour 
    override [SubContractValidator.$$assign](state: ValidateUpdateState<this>): ValidateUpdateState<this> {

        const { error, ...rest } = state as unknown as this

        this._applyError(error)

        return super[SubContractValidator.$$assign](rest as ValidateUpdateState<this>)
    }
}

//// Exports ////

