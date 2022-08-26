import is from '@benzed/is'
import shape from './shape-of'

import { describeValidator } from '../util.test'

describeValidator({
    factory: shape,
    input: [{
        x: is.number,
        y: is.number
    }],
    data: [
        ['string', false],
        [100, false],
        [undefined, false],
        [{ x: 0, y: 0 }, true],
        [{}, false],
        [{ x: 'string', y: false }, false],
    ]
})