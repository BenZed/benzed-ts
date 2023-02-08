import { $string } from './string'

import { testValidator } from '../../../util.test'

//// Tests ////
  
testValidator(
    $string,
    { transforms: 'hello-world' }
) 