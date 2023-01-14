import { Infer, isUnknown as _isUnknown } from '@benzed/util'

import IsType from './is-type'

//// Main ////

const unknown = new IsType({ type: 'unknown', is: _isUnknown })

//// Exports ////

export interface IsUnknown extends Infer<typeof unknown> {}
export const isUnknown: IsUnknown = unknown