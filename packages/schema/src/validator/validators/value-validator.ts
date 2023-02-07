import { Primitive } from '@benzed/util'
import { capitalize } from '@benzed/string'

import { ValidateOptions } from '../../validate'
import { ValidationContext } from '../../validation-context'
import { ValidationError } from '../../validation-error'
import { ValidatorStruct } from '../validator-struct'
import { ValidateStruct } from '../validate-struct'

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

    message(ctx: ValidationContext<unknown>): string {
        void ctx
        return `Must be ${String(this.value)}`
    }

    validate(input: unknown, options?: ValidateOptions | undefined): T {
        
        const ctx = new ValidationContext(input, options)
        ctx.transformed = this.value

        if (
            !ValidateStruct.equal(input, this.value) && 
            !(this.force && ctx.transform)
        )
            throw new ValidationError(this, ctx)

        return this.value
    }

}