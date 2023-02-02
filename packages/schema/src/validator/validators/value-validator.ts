import { Primitive } from '@benzed/util'
import { capitalize } from '@benzed/string'

import { ValidateOptions } from '../../validate'
import ValidationContext from '../../validation-context'
import ValidationError from '../../validation-error'
import { ValidatorStruct } from '../validator-struct'

/**
 * Validate an exact primitive value
 */
export class ValueValidator<T extends Primitive> extends ValidatorStruct<unknown, T> {

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

    override get name(): string {
        return capitalize(String(this.value))
    }

    error(): string {
        return `Must be ${String(this.value)}`
    }

    target(input: unknown, options?: ValidateOptions | undefined): T {
        
        const ctx = new ValidationContext(input, options)
        ctx.transformed = this.value

        if (
            !this.equal(input, this.value) && 
            !(this.force && ctx.transform)
        )
            throw new ValidationError(this.error(), ctx)

        return this.value
    }

    override equal<T>(input: unknown, output: T): input is T {
        return Object.is(input, output)
    }

}