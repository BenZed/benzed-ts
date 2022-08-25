import is from '@benzed/is'
import optional from './optional'

import describeValidator from './util.test'

describeValidator({
    factory: optional,
    input: [is.number],
    data: [
        ['string', false],
        [100, true],
        [undefined, true],
    ]
})

