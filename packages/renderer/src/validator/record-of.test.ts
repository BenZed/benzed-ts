import is from '@benzed/is'
import recordOf from './record-of'

import { describeValidator } from '../util.test'

describeValidator({
    factory: recordOf,
    input: [is.number],
    data: [
        [{ one: 1 }, true],
        [{ two: '2' }, false],
        [{ two: '2', one: 1 }, false],
        [{ two: 2, one: 1 }, true],
        [100, false],
        [[0, 1, 2, 3, 4], true],
        [undefined, false],
    ]
})
