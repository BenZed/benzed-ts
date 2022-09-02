import ffmpeg from 'fluent-ffmpeg'

import os from 'os'
import path from 'path'

import {
    AudioSetting,
    Input,
    Output,
    SizeSetting,
    VideoSetting,

} from './settings'

import getMetadata, { Metadata } from './get-metadata'

import { getFfmpegSizeOptionString, createOutputStreams } from './util'

import { isDefined } from '@benzed/is'

/*** Types ***/

type CreateMP4Options =
    Input
    & Output
    & Partial<SizeSetting>
    & VideoSetting
    & AudioSetting

/*** Constants ***/

const VIDEO_CODEC = 'libx264'
const AUDIO_CODEC = 'aac'
const VIDEO_FORMAT = 'mp4'
const PASS_LOG_FILE_PREFIX = 'benzed-renderer-passlog'
const DEFAULT_VIDEO_BIT_RATE = 10000
const DEFAULT_AUDIO_BIT_RATE = 128

/*** Main ***/

/**
 * Converts a source stream to an mp4 
 */
async function createMP4(
    options: CreateMP4Options
): Promise<Metadata & { renderTime: number }> {

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
    if (isDefined(fps) && fps > 0)
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

    const firstPassUrl = path.join(os.tmpdir(), renderStart.toString())

    // Required for two-pass encoding.
    const firstPassLogFile = path.join(os.tmpdir(), PASS_LOG_FILE_PREFIX)

    await new Promise((resolve, reject) => {
        const pass1Cmd = cmd.clone()
        pass1Cmd
            .addOutputOptions([
                `-passlogfile ${firstPassLogFile}`,
                '-pass 1'
            ])
            .on('error', reject)
            .on('end', resolve)
            .save(firstPassUrl)
    })

    const [metaStream, outputStream] = createOutputStreams(output)

    // Execute Second Pass
    const render = new Promise((resolve, reject) => {
        const pass2Cmd = cmd.clone()
        pass2Cmd
            .addOutputOptions([
                `-passlogfile ${firstPassLogFile}`,
                '-pass 2',
            ])
            .on('error', reject)
            .on('end', resolve)
            .outputOptions([
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

/*** Exports ***/

export default createMP4

export {
    createMP4,
    CreateMP4Options,
}