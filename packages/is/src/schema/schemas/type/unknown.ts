import { isUnknown as _isUnknown } from '@benzed/util'

import IsType from './type'

//// Exports ////

export interface IsUnknown extends IsType<unknown> {}
export const isUnknown: IsUnknown = new IsType({ name: 'unknown', is: _isUnknown })