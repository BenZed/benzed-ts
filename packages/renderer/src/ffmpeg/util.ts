
import fs from '@benzed/fs'
import { isString, isNumber } from '@benzed/is'

import { Output, SizeSetting } from './settings'

import { Readable, Writable } from 'stream'

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

export function createOutputStreams(output: Output['output']): [meta: Readable, output: Writable] {

    const metaReader = new Readable({
        read: size => void size
    })

    const outputWriter = isString(output)
        ? fs.createWriteStream(output)
        : output

    const defaultWrite = outputWriter.write.bind(outputWriter)

    // push the written data to the reader stream
    outputWriter.write = (
        (chunk, encoding, next) => {
            metaReader.push(chunk, encoding)
            defaultWrite(chunk, encoding, next)
        }
    ) as typeof outputWriter.write

    outputWriter.on('finish', () => {
        metaReader.destroy()
    })

    return [metaReader, outputWriter]
}