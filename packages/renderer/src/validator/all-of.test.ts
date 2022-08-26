import is from '@benzed/is'

import allOf from './all-of'
import shapeOf from './shape-of'

import { describeValidator } from '../util.test'

describeValidator({
    factory: allOf,
    input: [shapeOf({ x: is.number }), shapeOf({ y: is.number })],
    data: [
        [{ x: 0, y: 0 }, true],
        [{ x: 0 }, false],
        [{ y: 0 }, false],
        [false, false],
        [0, false],
        [true, false],
    ]
})
