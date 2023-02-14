import { $boolean, Boolean } from './boolean'

import { testValidator, testValidationContract } from '../../util.test'
import { expectTypeOf } from 'expect-type'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/ban-types
*/
//// Tests ////

describe(`${$boolean.name} validator contract tests`, () => {

    testValidationContract<unknown, boolean>(
        $boolean,
        {
            validInput: true,
            invalidInput: -100,
            transforms: { invalidInput: 'true', validOutput: true },
        }
    )

})

testValidator<unknown, boolean>(
    $boolean,
    { asserts: false },
    { asserts: 0, error: 'Must be a Boolean' },
    { transforms: 0, output: false },
    { transforms: 1, output: true },
    { transforms: 'true', output: true },
    { transforms: 'false', output: false },
    { asserts: 'false', error: 'Must be a Boolean' },
)

it('setter return type', () => {

    const $true = $boolean.cast(() => true)

    expectTypeOf($true).toMatchTypeOf<Boolean>()

})