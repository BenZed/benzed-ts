import { isDefined } from '@benzed/is'
import ffmpeg from 'fluent-ffmpeg'

import {
    AudioOptions,
    Input,
    Output
} from './options'

/*** Types ***/

type CreateMP3Options =
    & Input
    & Output
    & AudioOptions

/*** Constants ***/

const AUDIO_CODEC = 'libmp3lame'
const OUTPUT_FORMAT = 'mp3'

/*** Main ***/

/**
 * Converts a source stream to an mp4 
 */
function createMP3(
    options: CreateMP3Options
): Promise<number> {

    const {
        abr,
        input,
        output,
    } = options

    // Create command from options
    const cmd = ffmpeg(input)
        .audioCodec(AUDIO_CODEC)
        .format(OUTPUT_FORMAT)

    if (isDefined(abr))
        cmd.audioBitrate(abr)

    const start = Date.now()

    throw new Error('Not yet implemented.')

    const renderTime = Date.now() - start
    return Promise.resolve(renderTime)
}

/*** Exports ***/

export default createMP3

export {
    createMP3,
    CreateMP3Options,
}