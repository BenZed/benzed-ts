import { $promise } from './promise'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'

//// Tests ////

describe(`${$promise.name} validator tests`, () => {

    testValidator<unknown, Promise<unknown>>(
        $promise,
        { asserts: Promise.resolve() },
    )

})