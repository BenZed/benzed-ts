import { CallableStruct } from '@benzed/immutable'

import { Validate } from '../../validate'

//// Main ////

class Validator<I, O extends I = I> extends ValidateStruct<I,O> {}

//// Exports ////
