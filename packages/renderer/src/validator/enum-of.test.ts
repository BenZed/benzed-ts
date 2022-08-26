
import enumOf from './enum-of'

import { describeValidator } from '../util.test'

describeValidator({
    factory: enumOf,
    input: ['foo', 'bar', 1, 2] as never,
    data: [
        ['foo', true],
        ['bar', true],
        [1, true],
        [2, true],
        [0, false],
        [true, false],
    ]
})
