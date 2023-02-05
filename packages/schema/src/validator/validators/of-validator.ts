
import { $$state } from '@benzed/immutable'
import { OutputOf } from '@benzed/util'
import ValidationContext from '../../validation-context'

import { $$target, ValidatorProxy, ValidatorProxyState } from '../validator-proxy'
import { AnyValidatorStruct, ValidatorErrorMessage } from '../validator-struct'

//// Type ////

type OfValidatorState<V extends AnyValidatorStruct> = 
    ValidatorProxyState<V> & { 
        message: ValidatorErrorMessage<V>
        name: string 
    }

//// Setup ////

abstract class OfValidator<
    V extends AnyValidatorStruct,
    O = OutputOf<V>
> extends ValidatorProxy<V, unknown, O> {

    get of(): V {
        return this[$$target]
    }

    override message(ctx: ValidationContext<unknown>): string {
        void ctx
        return `Must be ${this.name} of ${this.of.name}`
    }

    //// State ////
    
    get [$$state](): OfValidatorState<V> {
        return {
            [$$target]: this[$$target],
            message: this.message,
            name: this.name
        }
    }
}

//// Exports ////

export default OfValidator

export {
    OfValidator,
    OfValidatorState
}