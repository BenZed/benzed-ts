import { equals } from '@benzed/immutable'
import { Primitive } from '@benzed/util'

import ContractValidator from './contract-validator'

/**
 * Validate an exact primitive value
 */
export class ValueValidator<T extends Primitive> extends ContractValidator<unknown, T> {

    constructor(
        readonly value: T, 
        
        /**
         * If the input is not the expected value, return the expected value.
         * Basically, an automatic transform.
         */
        readonly force = false
    ) {
        super()
    }

    override transform(input: unknown) {
        return this.force ? this.value : input
    }

    override isValid(input: unknown): boolean {
        return equals(input, this.value)
    }

    override readonly message = `Must be ${this.name}`

}