
import { Instance } from './instance'

import { testValidator } from '../../../util.test'

//// Tests //// 

class Foo {}

const $foo = new Instance({ Type: Foo })

testValidator(
    $foo,
    $foo.name + ' instance',
    { input: new Foo(), outputSameAsInput: true },
    { input: 0, error: `ust be ${Foo.name}` }
)
