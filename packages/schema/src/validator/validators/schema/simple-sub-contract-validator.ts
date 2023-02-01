import { isString, Property } from '@benzed/util'

import { ContractValidator, ContractValidatorSettings } from '../../contract-validator'

import { ValidateUpdateState } from '../../validate-struct'

import { SubValidatorConfigure } from './sub-validator'

import { 
    SimpleSubValidator, 
    ValidateErrorMethod 
} from './simple-sub-validator'

//// Main ////

/**
 * Convenience class for creating contract sub validators that only take
 * an error as configuration
 */
export abstract class SimpleSubContractValidator<T> extends ContractValidator<T, T>
    implements SubValidatorConfigure<T> {

    constructor(
        readonly enabled: boolean,
        error: string | ValidateErrorMethod = 'Validation failed.'
    ) {
        super()

        // mix-in configurer

        this._applyError(error)
        this._applyConfigurer()
    }

    readonly configure!: SubValidatorConfigure<T>['configure']

    //// Helper ////
    
    private _applyError(error: string | ValidateErrorMethod): void {

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

    /**
     * Update our state assignment signature to handle error configuration
     * coming from SimpleSubValidator, as it needs to be converted to a function.
     */
    override [ContractValidator.$$assign](state: ContractValidatorSettings<T,T>): ValidateUpdateState<this> {

        const { error, ...rest } = state
        if (error)
            this._applyError(error)

        return super[ContractValidator.$$assign](rest as ValidateUpdateState<this>)
    }
}

//// Exports ////

