import ffmpeg from 'fluent-ffmpeg'
import { is } from '@benzed/is'

import {
    AudioSetting,
    Input,
    Output,
    SizeSetting,
    VideoSetting,

} from './settings'

import getMetadata, { RenderMetadata } from './get-metadata'

import { getFfmpegSizeOptionString, createOutputStreams } from './util'

//// Types ////

type CreateMP4Options =
    Input
    & Output
    & Partial<SizeSetting>
    & VideoSetting
    & AudioSetting

//// Constants ////

const VIDEO_CODEC = 'libx264'
const AUDIO_CODEC = 'aac'
const VIDEO_FORMAT = 'mp4'
const DEFAULT_VIDEO_BIT_RATE = 10000
const DEFAULT_AUDIO_BIT_RATE = 128

//// Main ////

/**
 * Converts a source stream to an mp4 
 */
async function createMP4(
    options: CreateMP4Options
): Promise<RenderMetadata> {

    const {
        vbr = DEFAULT_VIDEO_BIT_RATE,
        abr = DEFAULT_AUDIO_BIT_RATE,
        fps,
        input,
        output,
    } = options

    // Create command from options
    const cmd = ffmpeg(input)
        .videoCodec(VIDEO_CODEC)
        .outputFormat(VIDEO_FORMAT)

    // Optionally set bit rate
    cmd.videoBitrate(vbr)
    if (is.number(fps) && fps > 0)
        cmd.outputFPS(fps)

    if (abr <= 0)
        cmd.noAudio()
    else {
        cmd.audioCodec(AUDIO_CODEC)
        cmd.audioBitrate(abr)
    }

    const size = getFfmpegSizeOptionString(options)
    if (size)
        cmd.size(size)

    // Execute First Pass
    const renderStart = Date.now()

    const [outputStream, metaStream] = createOutputStreams(output)

    // Execute Second Pass
    const render = new Promise((resolve, reject) => {
        const pass2Cmd = cmd.clone()
        pass2Cmd
            .on('error', reject)
            .on('end', resolve)
            .addOptions([
                '-movflags frag_keyframe+empty_moov' // allows streaming
            ])
            .output(outputStream, { end: true })
            .run()
    })

    const [metadata] = await Promise.all([
        getMetadata({ input: metaStream }),
        render
    ])

    const renderTime = Date.now() - renderStart

    return {
        ...metadata,
        renderTime
    }
}

//// Exports ////

export default createMP4

export {
    createMP4,
    CreateMP4Options,
}