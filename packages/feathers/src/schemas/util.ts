import { $ } from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/no-explicit-any
*/

/*** Miscellaneous Schemas ***/

/**
 * Number in port range, 1024 - 65535
 */
export const $port = $
    .integer
    .range(1024, 65535, port => `${port} is not a valid port`)
    .name('port')

/**
 * TODO make this an object id
 */
export const $id = $.string
    .format(/^[a-f\d]{24}$/i, 'must formatted as an object-id')
    .name('object-id')

/**
 * Nullable id
 */
export const $ref = $.or($id, $.null)
    .default(null)
    .name('object-id-ref')

/**
 * Pagination object.
 */
export const $pagination = $({
    default: $.integer,
    max: $.integer
}).name('pagination settings')