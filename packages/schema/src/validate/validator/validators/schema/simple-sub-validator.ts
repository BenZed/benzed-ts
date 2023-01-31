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
type ValidateErrorMethod = NonNullable<ContractValidatorSettings<unknown, unknown>['error']>

const toEnabledError = new SignatureParser({
    enabled: isOptional(isBoolean),
    error: isOptional(isOneOf(isString, isFunc<ValidateErrorMethod>))
}).setDefaults({
    enabled: true
}).addLayout('enabled', 'error')
    .addLayout('error')

type EnabledErrorSignature = Parameters<typeof toEnabledError>

//// Main ////

/**
 * Convenience class for sub validators that only take
 * an error as configuration
 */
abstract class SimpleSubValidator<T> extends SubValidator<T>
    implements SubValidatorConfigure<T> {

    constructor(
        readonly enabled: boolean, 
        readonly error: string | ValidateErrorMethod
    ) {
        super()
    }

    configure(
        ...args: EnabledErrorSignature
    ): { enabled: boolean, error: string | ValidateErrorMethod } {

        const { error = this.error, enabled } = toEnabledError(...args)
        return { error, enabled }
    }

}

//// Exports ////

export default SimpleSubValidator

export {
    SimpleSubValidator,
    EnabledErrorSignature,
    toEnabledError,
    ValidateErrorMethod
}