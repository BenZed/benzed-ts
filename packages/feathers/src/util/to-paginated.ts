import { isArray } from '@benzed/is'
import { Paginated } from '@feathersjs/feathers'

/*** Main ***/

/**
 * Casts a feathers result to a paginated feathers result
 * @param input 
 * @returns output, paginated
 */
function toPaginated<R>(input: R[] | Paginated<R>): Paginated<R> {
    return isArray(input)
        ? { data: input, total: input.length, skip: 0, limit: input.length }
        : input
}

/*** Exports ***/

export default toPaginated

export {
    toPaginated
}