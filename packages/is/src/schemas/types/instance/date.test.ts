import { $date } from './date'

import { describe } from '@jest/globals'

import { testValidator } from '../../../util.test'

//// Tests ////

describe(`${$date.name} validator tests`, () => {
    testValidator<unknown, Date>(
        $date,
        { transforms: 1500, output: new Date(1500) },
        { transforms: 2500, output: new Date(2500) },
        { transforms: 5000, output: new Date(5000) },
    )
})
