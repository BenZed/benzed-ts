import { nil } from '@benzed/util'
import { Struct } from '../struct'

import {
    StateGetter,
    StateSetter
} from './state'

//// Helper ////

function getStateDescriptor<T extends Struct>(struct: T): PropertyDescriptor | nil {

}

//// Exports ////

export function hasStateGetter<T = object>(struct: Struct): struct is Struct & StateGetter<T> {
    const stateDescriptor = getStateDescriptor(struct)
    if (!stateDescriptor)
        return false

    return 'value' in stateDescriptor || !!stateDescriptor.get
}

/**
 * Returns true if the given struct has bespoke state
 * application logic.
 */
export function hasStateSetter<T = object>(struct: Struct): struct is Struct & StateSetter<T> {
    const stateDescriptor = getStateDescriptor(struct)
    return !!stateDescriptor?.writable || !!stateDescriptor?.set
}

