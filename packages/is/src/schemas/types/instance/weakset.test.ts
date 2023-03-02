import { $weakset } from './weakset'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'

//// Tests ////

describe(`${$weakset.name} validator tests`, () => {

    testValidator<unknown, WeakSet<object>>(
        $weakset,
        { asserts: new WeakSet() },
    )

})