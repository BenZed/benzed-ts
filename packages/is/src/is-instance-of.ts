/* eslint-disable
    @typescript-eslint/no-explicit-any  
*/

import type { Constructor } from './types'

/**
 * True if a given value is an instance of one of
 * the given types.
 * @param input value
 * @param types types to check against
 * @returns true or false
 */
function isInstanceOf<T extends (Constructor<any>)[]>(
    input: unknown,
    ...types: T
): input is InstanceType<typeof types[number]> {
    return types.some(type => input instanceof type)
}

/*** Exports ***/

export default isInstanceOf

export { isInstanceOf }