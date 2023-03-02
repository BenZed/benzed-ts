import { $weakmap } from './weakmap'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'

//// Tests ////

describe(`${$weakmap.name} validator tests`, () => {

    testValidator<unknown, WeakMap<object,unknown>>(
        $weakmap,
        { asserts: new WeakMap() },
    )

})