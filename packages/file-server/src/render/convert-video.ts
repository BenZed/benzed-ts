import { Readable, Writable } from 'stream'

import os from 'os'
import path from 'path'
import fs from 'fs'

import ffmpeg from 'fluent-ffmpeg'

/*** Types ***/

type DimensionOptions = {
    height: number
} | {
    width: number
} | {
    height: number
    width: number
} | {
    dimension?: number | `${number}%`
}

type ConverVideoOptions = {

    input: string | Readable
    output: string | Writable

    /**
     * Video bit rate
     */
    vbr?: number

    /**
     * Audio bit rate
     */
    abr?: number

    /**
     * Frame rate
     */
    fps?: number

} & DimensionOptions

/*** Constants ***/

const VIDEO_FORMAT = 'mp4'
const VIDEO_CODEC = 'libx264'

/*** Helper ***/

function getSize(input: DimensionOptions): string | undefined {

    if ('dimension' in input)
        return input.dimension?.toString()

    const width = 'width' in input ? input.width : '?'
    const height = 'height' in input ? input.height : '?'

    return `${width}x${height}`
}

/*** Main ***/

async function convertVideo(
    options: ConverVideoOptions
): Promise<number> {

    const {
        vbr,
        abr,
        fps,
        input,
        output
    } = options

    // Create command from options
    const cmd = ffmpeg(input)
        .videoCodec(VIDEO_CODEC)
        .format(VIDEO_FORMAT)

    if (vbr !== undefined && vbr > 0)
        cmd.videoBitrate(vbr)

    if (abr === undefined || abr <= 0)
        cmd.noAudio()
    else
        cmd.audioBitrate(abr)

    const size = getSize(options)
    if (size)
        cmd.size(size)

    if (fps !== undefined && fps > 0)
        cmd.outputFPS(fps)

    // Execute First Pass
    const start = Date.now()
    const firstPassUrl = path.join(os.tmpdir(), start.toString())

    await new Promise((resolve, reject) => {
        const pass1Cmd = cmd.clone()
        pass1Cmd
            .addInputOption([
                '-pass 1'
            ])
            .on('error', reject)
            .on('end', resolve)
            .save(firstPassUrl)
    })

    // Execute Second Pass
    await new Promise((resolve, reject) => {
        const pass2Cmd = cmd.clone()
        pass2Cmd
            .addInputOption([
                '-pass 2',
                '-y' // overwrite flag
            ])
            .on('error', reject)
            .on('end', resolve)
            .output(output)
            .run()
    })

    // Delete temp first pass file
    await new Promise<void>(resolve =>
        fs.unlink(firstPassUrl, () => resolve())
    )

    const renderTime = Date.now() - start
    return renderTime
}

/*** Exports ***/

export default convertVideo

export {
    convertVideo,
    ConverVideoOptions,
}