/*** Shortcuts ***/

const { floor, random } = Math

/*** Main ***/

/**
 * Randomly re-arranges a given array.
 *
 * @param  {Array} input ArrayLike to be sorted.
 * @return {Array} ArrayLike is mutated in place, but method returns it anyway.
 */
function shuffle<T extends ArrayLike<unknown>>(
    input: T
): typeof input {

    let index = input.length - 1

    const inputMut = input as { [index: number]: T }

    while (index > 0) {

        const randomIndex = floor(random() * input.length)

        index--

        const item = inputMut[index]
        inputMut[index] = inputMut[randomIndex]
        inputMut[randomIndex] = item

    }

    return input
}

/*** Exports ***/

export default shuffle
