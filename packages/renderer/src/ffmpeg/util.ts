import { isNumber } from '@benzed/is'

import { SizeSetting } from './settings'

/*** Typesw ***/

type AxisString = `${number | '?'}x${number | '?'}`
type ScaleString = `${number}%`

/*** Exports ***/

/**
 * Get an ffmpeg size string from SizeOptions
 */
export function getFfmpegSizeOptionString(
    input: Partial<SizeSetting>
):
    AxisString |
    ScaleString |
    undefined {

    if ('dimensions' in input && isNumber(input.dimensions))
        return `${input.dimensions}x${input.dimensions}`

    if ('scale' in input && isNumber(input.scale))
        return `${input.scale * 100}%`

    const width = 'width' in input ? input.width ?? '?' : '?'
    const height = 'height' in input ? input.height ?? '?' : '?'

    const size: AxisString = `${width}x${height}`
    return size === '?x?' ? undefined : size
}
