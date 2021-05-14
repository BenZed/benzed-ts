
const { indexOf, splice } = Array.prototype

/*** Main ***/

function remove<T>(input: ArrayLike<T>, value: T): typeof input {

  const inputIndexOf = indexOf.bind(input)
  let inputSplice
  let index: number

  do {

    index = inputIndexOf(value)
    if (index > -1) {
      inputSplice = inputSplice || splice.bind(input)
      inputSplice(index, 1)
    }

  } while (index >= 0)

  return input

}

/*** Exports ***/

export default remove
