
export function first<T>(
    this: ArrayLike<T> | void,
    array: ArrayLike<T> | void
): T | undefined {

    if (this !== undefined)
        array = this

    return array
        ? array[0]
        : undefined
}

export function last<T>(
    this: ArrayLike<T> | void,
    array: ArrayLike<T> | void
): T | undefined {

    if (this !== undefined)
        array = this

    return array
        ? array[array.length - 1]
        : undefined
}