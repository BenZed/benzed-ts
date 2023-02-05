
import { OutputOf } from '@benzed/util'

import { $$target, ValidatorProxy } from '../validator-proxy'
import { AnyValidatorStruct } from '../validator-struct'

//// Setup ////

/**
 * An array that validates a collection data type that contains a sub data type
 */
abstract class OfValidator<
    V extends AnyValidatorStruct,
    O = OutputOf<V>
> extends ValidatorProxy<V, unknown, O> {

    override get name(): string {
        return this.constructor.name.replace('Validator', '') || 'Validator'
    }

    get of(): V {
        return this[$$target]
    }

}

//// Exports ////

export default OfValidator

export {
    OfValidator
}