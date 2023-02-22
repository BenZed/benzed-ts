
import { test } from '@jest/globals'
import { Trait } from '@benzed/traits'
import { isNumber } from '@benzed/util'

import { Validator } from './validator'
import { ValidateOptions } from '../validate'

import ValidationContext from '../validation-context'

//// Example Validator ////

class NumberValidator extends Trait.use(Validator) {

    analyze(
        input: unknown, 
        options?: ValidateOptions
    ): ValidationContext<unknown, number> {

        const ctx = new ValidationContext<unknown, number>(input, options)

        return isNumber(input)
            ? ctx.setOutput(input)
            : ctx.setError('Must be a number')
    }

}

//// Tests ////

test.todo(`${Validator.name}`)

