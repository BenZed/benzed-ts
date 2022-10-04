import { $ } from '@benzed/schema'

/* eslint-disable 
    @typescript-eslint/explicit-function-return-type,
    @typescript-eslint/no-explicit-any
*/

/*** Miscellaneous Schemas ***/

/**
 * Number in port range, 1024 - 65535
 */
export const $port = $.integer().range(1024, 65535)

/**
 * TODO make this an object id
 */
export const $id = $.string()

export const $ref = $.or($id, $.null())

/**
 * Pagination object.
 */
export const $pagination = $({
    default: $.integer(),
    max: $.integer()
})