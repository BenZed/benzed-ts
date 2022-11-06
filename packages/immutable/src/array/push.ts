import copy from '../copy'

//// Shortcuts ////

const { push: _push } = Array.prototype

type PushParams = Parameters<typeof Array.prototype.push>

//// Main ////

/**
 * Immutably pop an ArrayLike.
 * 
 * @returns A clone of the input Arraylike not including the final, popped off item.
 */
export default function push<T extends ArrayLike<unknown>>(
    arr: T,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    ...args: PushParams
): typeof arr {

    const output = copy(arr)
    _push.apply(output, args)
    return output
}

export { push }