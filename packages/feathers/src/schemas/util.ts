import { $ } from '@benzed/schema'

/*** Miscellaneous Schemas ***/

/**
 * Number in port range, 1024 - 65535
 */
export const $port = $.number().range(1024, 65535)
