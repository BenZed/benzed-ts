
import { isString, isNumber } from '@benzed/is'
import fs from '@benzed/fs'

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

    if (`dimensions` in input && isNumber(input.dimensions))
        return `${input.dimensions}x${input.dimensions}`

    if (`scale` in input && isNumber(input.scale))
        return `${input.scale * 100}%`

    const width = `width` in input ? input.width ?? `?` : `?`
    const height = `height` in input ? input.height ?? `?` : `?`

    const size: AxisString = `${width}x${height}`
    return size === `?x?` ? undefined : size
}

export function createOutputStreams(
    output: Output['output']
): [outputWriter: Writable, metaReader: Readable] {

    const metaReader = new Readable({
        read() { /**/ }
    })

    const outputWriter = isString(output)
        ? fs.createWriteStream(output)
        : output

    // push any data being written to the meta reader stream
    const originalWrite = outputWriter.write.bind(outputWriter)
    const overrideWrite = ((chunk, encoding, next) => {
        metaReader.push(chunk, encoding)
        return originalWrite(chunk, encoding, next)
    }) as typeof originalWrite

    outputWriter.write = overrideWrite

    // cap read stream when the writer is finished
    outputWriter.on(`close`, () => metaReader.push(null))

    return [outputWriter, metaReader]
}