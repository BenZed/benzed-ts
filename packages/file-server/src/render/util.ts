import { isNumber } from '@benzed/is'
import { SizeOptions } from './options'

/*** Exports ***/

/**
 * Get an ffmpeg size string from SizeOptions
 */
export function getSize(input: SizeOptions): string | undefined {

    if ('dimensions' in input && isNumber(input.dimensions))
        return `${input.dimensions}x${input.dimensions}`

    if ('scale' in input && isNumber(input.scale))
        return `${input.scale * 100}%`

    const width = 'width' in input ? input.width : '?'
    const height = 'height' in input ? input.height : '?'

    const size = `${width}x${height}`
    return size === '?x?' ? undefined : size
}
