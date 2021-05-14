/*** Shortcuts ***/

const { splice } = Array.prototype
const { floor, random } = Math

/*** Main ***/

/**
 * Randomly re-arranges a given array.
 *
 * @param  {Array} input ArrayLike to be sorted.
 * @return {Array} ArrayLike is mutated in place, but method returns it anyway.
 */
function shuffle<T>(
    input: ArrayLike<T>
): typeof input {

    let index = input.length

    const inputSplice = splice.bind(input)

    while (index > 0) {

        const randomIndex = floor(random() * input.length)

        index--

        const fromItem = input[index]
        const toItem = input[randomIndex]

        inputSplice(index, 1, toItem)
        inputSplice(randomIndex, 1, fromItem)

    }

    return input
}

/*** Exports ***/

export default shuffle
