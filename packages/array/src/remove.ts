
const { indexOf, splice } = Array.prototype

/*** Main ***/

/**
 * Removes all instances of a given value in an ArrayLike<T>
 * @param input 
 * @param value 
 * @returns 
 */
function remove<T>(input: ArrayLike<T>, value: T): typeof input {

  const inputIndexOf = indexOf.bind(input)
  const inputSplice = splice.bind(input)
  let index: number

  do {

    index = inputIndexOf(value)
    if (index > -1)
      inputSplice(index, 1)

  } while (index >= 0)

  return input

}

/*** Exports ***/

export default remove
