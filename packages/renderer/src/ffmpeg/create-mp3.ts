import ffmpeg from 'fluent-ffmpeg'

import { is } from '@benzed/is'

import {
    Metadata
} from './get-metadata'

import {
    AudioSetting,
    Input,
    Output
} from './settings'

//// Types ////

type CreateMP3Options =
    & Input
    & Output
    & AudioSetting

//// Constants ////

const AUDIO_CODEC = 'libmp3lame'
const OUTPUT_FORMAT = 'mp3'

//// Main ////

/**
 * Converts a source stream to an mp4 
 */
function createMP3(
    options: CreateMP3Options
): Promise<Metadata & { renderTime: number }> {

    const {
        abr,
        input,
        output,
    } = options

    // Create command from options
    const cmd = ffmpeg(input)
        .audioCodec(AUDIO_CODEC)
        .format(OUTPUT_FORMAT)

    if (is.defined(abr))
        cmd.audioBitrate(abr)

    const start = Date.now()

    throw new Error('Not yet implemented.')
    void output
    const renderTime = Date.now() - start
    return Promise.resolve({ renderTime })
}

//// Exports ////

export default createMP3

export {
    createMP3,
    CreateMP3Options,
}