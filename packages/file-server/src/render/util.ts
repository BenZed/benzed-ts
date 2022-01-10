import { isNumber } from '@benzed/is/lib'
import { SizeOptions } from './options'

/*** Exports ***/

/**
 * Get an ffmpeg size string from SizeOptions
 */
export function getSize(input: SizeOptions): string | undefined {

    if ('dimension' in input) {
        return isNumber(input.dimension)
            ? `${input.dimension}x${input.dimension}`
            : input.dimension
    }

    const width = 'width' in input ? input.width : '?'
    const height = 'height' in input ? input.height : '?'

    const size = `${width}x${height}`
    return size === '?x?' ? undefined : size
}
