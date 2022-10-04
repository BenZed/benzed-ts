import { $ } from '@benzed/schema'

/*** Miscellaneous Schemas ***/

/**
 * Number in port range, 1024 - 65535
 */
export const $port = $.integer().range(1024, 65535)

/**
 * TODO make this an object id
 */
export const $id = $.string()

/**
 * Pagination object.
 */
export const $pagination = $({
    default: $.integer(),
    max: $.integer()
})