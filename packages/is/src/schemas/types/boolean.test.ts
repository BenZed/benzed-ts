import { $boolean } from './boolean'

import { testValidator, testValidationContract } from '../../util.test'
import { nil } from '@benzed/util'

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

testValidator<unknown, boolean>(
    $boolean.default(true),
    { transforms: nil, output: true },
    { asserts: nil, error: true }
)

testValidator<unknown, boolean>(
    $boolean.default(() => true),
    { transforms: nil, output: true },
    { asserts: nil, error: true }
)