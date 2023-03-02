import { $regexp } from './regexp'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'

//// Tests ////

describe(`${$regexp.name} validator tests`, () => {

    testValidator<unknown, RegExp>(
        $regexp,
        { asserts: /ace/ },
    )

}) 