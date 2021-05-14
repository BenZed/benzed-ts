import { abs } from './overrides'

/*** Main ***/

/**
 * Iterates through each number in a given range with a given step.
 * @param from 
 * @param to 
 * @param step 
 */
function* range(from: number, to: number, step = 1): Iterable<number> {

    step = abs(step)

    const ascending = to > from
    const delta = ascending ? step : -step

    for (let i = from; ascending ? i < to : i > to; i += delta)
        yield i
}

/*** Exports ***/

export default range
