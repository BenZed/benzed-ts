/*** Main ***/

interface ShuffleAble<T> {
  length: number;
  [index: number]: T;
}

/**
 * Randomly re-arranges a given array.
 *
 * @param  {Array} array Array to be sorted.
 * @return {Array}       Array is mutated in place, but method returns it anyway.
 */
function shuffle<T>(array: ShuffleAble<T>): typeof array {

  let index = array.length

  while (index > 0) {

    const randomIndex = Math.floor(
      Math.random() * array.length
    )

    index--

    const temp = array[index]
    array[index] = array[randomIndex]
    array[randomIndex] = temp

  }

  return array
}

/*** Exports ***/

export default shuffle
