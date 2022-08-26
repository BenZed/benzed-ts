import is from '@benzed/is'
import oneOf from './one-of'

import { describeValidator } from '../util.test'

describeValidator({
    factory: oneOf,
    input: [is.number, is.string],
    data: [
        ['string', true],
        [100, true],
        [undefined, false],
    ]
})
