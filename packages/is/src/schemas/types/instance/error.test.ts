import { $error } from './error'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'

//// Tests ////

describe(`${$error.name} validator tests`, () => {

    testValidator(
        $error,
        { asserts: new Error('Problem') },
    ) 

})