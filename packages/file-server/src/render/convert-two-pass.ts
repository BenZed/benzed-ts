import ffmpeg from 'fluent-ffmpeg'

import os from 'os'
import path from 'path'

import {
    AudioOptions,
    Input,
    Output,
    SizeOptions,
    VideoOptions,
    VideoOutputFormats,
    VIDEO_OUTPUT_FORMATS,

} from './options'
import { getSize } from './util'

import { first } from '@benzed/array'
import { isDefined } from '@benzed/is'
import { RequirePartial } from '@benzed/util'

/*** Types ***/

type VideoOptionsVbrRequired = RequirePartial<VideoOptions, 'vbr'>

type ConvertTwoPassOptions =
    & Input
    & Output<VideoOutputFormats>
    & SizeOptions
    & VideoOptionsVbrRequired
    & AudioOptions

/*** Constants ***/

const VIDEO_CODEC = 'libx264'
const PASS_LOG_FILE_PREFIX = 'benzed-renderer-passlog'

/*** Main ***/

/**
 * Converts a source stream to an mp4 
 */
async function convertTwoPass(
    options: ConvertTwoPassOptions
): Promise<number> {

    const {
        vbr,
        abr,
        fps,
        input,
        output,
        format = first.assert(VIDEO_OUTPUT_FORMATS)
    } = options

    // Create command from options
    const cmd = ffmpeg(input)
        .videoCodec(VIDEO_CODEC)
        .format(format)

    // Optionally set bit rate
    if (isDefined(vbr) && vbr > 0)
        cmd.videoBitrate(vbr)
    if (isDefined(fps) && fps > 0)
        cmd.outputFPS(fps)

    if (!isDefined(abr) || abr <= 0)
        cmd.noAudio()
    else
        cmd.audioBitrate(abr)

    const size = getSize(options)
    if (size)
        cmd.size(size)

    // Execute First Pass
    const start = Date.now()

    const firstPassUrl = path.join(os.tmpdir(), start.toString())

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

    // Execute Second Pass
    await new Promise((resolve, reject) => {
        const pass2Cmd = cmd.clone()
        pass2Cmd
            .addOutputOptions([
                `-passlogfile ${firstPassLogFile}`,
                '-pass 2',
            ])
            .on('error', reject)
            .on('end', resolve)
            .output(output)
            .run()
    })

    const renderTime = Date.now() - start
    return renderTime
}

/*** Exports ***/

export default convertTwoPass

export {
    convertTwoPass,
    ConvertTwoPassOptions,
}