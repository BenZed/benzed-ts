//// Shortcuts ////

const { splice, findIndex } = Array.prototype

//// Helper ////

//// Main ////

/**
 * Given filter arguements, return true if the provided 
 */
function unique<T>(value: T, index: number, array: ArrayLike<T>): boolean
function unique<T extends string | ArrayLike<unknown>>(arrayLike: T): T
function unique<T extends ArrayLike<unknown>>(this: T): T
function unique(this: unknown, pivot?: unknown, index?: number, array?: ArrayLike<unknown>): unknown {
    
    if (this) 
        return unique(this as ArrayLike<unknown>)
    
    if (array) 
        return findIndex.call(array, value => Object.is(pivot, value)) === index
    else   
        array = pivot as ArrayLike<unknown>
        
    if (typeof array === 'string')
        return unique(array.split('')).join('')

    for (let i = array.length - 1; i >= 0; i--) {
        if (!unique(array[i], i, array)) 
            splice.call(array, i, 1)
    }
    return array
}

//// Exports ////

export default unique