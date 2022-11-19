import { $, Infer } from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/no-explicit-any
*/

//// Miscellaneous Schemas ////

/**
 * Number in port range, 1024 - 65535
 */
export const $port = $
    .integer
    .range(1024, 65535)
    .name('port')

/**
 */
export const $id = $.string
    .format(/^[a-f\d]{24}$/i, 'must formatted as an object-id')
    .name({ article: 'an', name: 'object-id' })

/**
 * Nullable id
 */
export const $ref = $.or($id, $.null)
    .default(null)
    .name({ article: 'an', name: 'object-id-ref' })

/**
 * Pagination object.
 */
export interface Pagination extends Infer<typeof $pagination> {}
export const $pagination = $({
    default: $.integer.range('>', 0),
    max: $.integer.range('>', 0)
}).name('pagination settings')