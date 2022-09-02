import ffmpeg from 'fluent-ffmpeg'

import { getMetadata } from './get-metadata'
import {
    Input,
    Output,
    SizeSetting,
    TimeSetting
} from './settings'
import { getFfmpegSizeOptionString } from './util'

import { clamp } from '@benzed/math'
import { isDefined, isNumber, isString } from '@benzed/is'

/*** Types ***/

type CreatePNGOptions =
    & Input
    & Output
    & Partial<TimeSetting>
    & Partial<SizeSetting>

/*** Constants ***/

const IMAGE_FORMAT = 'png'

/*** Helper ***/

async function getTimeStamp(options: CreatePNGOptions): Promise<number> {

    const { input } = options
    const { duration, frameRate } = await getMetadata({ input })

    if (!isDefined(duration) || !isDefined(frameRate))
        return 0

    const frameDuration = 1 / frameRate
    const maxFrameDuration = duration - frameDuration

    if ('seconds' in options && isNumber(options.seconds)) {

        const { seconds } = options

        const timeStamp = seconds >= 0
            // from beginning
            ? clamp(seconds, 0, maxFrameDuration)
            // from end
            : clamp(duration + seconds, 0, maxFrameDuration)

        return timeStamp

    } else {

        const progress = 'progress' in options ? options.progress ?? 0 : 0

        const timeStamp = clamp(progress * maxFrameDuration, 0, maxFrameDuration)
        return timeStamp
    }
}

/*** Main ***/

async function createPNG(options: CreatePNGOptions): Promise<number> {

    const { input, output } = options

    const cmd = ffmpeg(input)

    const timeStamp = await getTimeStamp(options)

    cmd.videoCodec(IMAGE_FORMAT)
        .seek(timeStamp)
        .frames(1)

    if (!isString(output))
        cmd.format('image2pipe')

    const size = getFfmpegSizeOptionString(options)
    if (isDefined(size))
        cmd.setSize(size)

    const start = Date.now()

    try {

        await new Promise((resolve, reject) => cmd
            .on('end', resolve)
            .on('error', reject)
            .output(output)
            .run()
        )

    } catch (e) {
        throw e
    }

    const renderTime = Date.now() - start
    return renderTime
}

/*** Exports ***/

export default createPNG

export {
    createPNG,
    CreatePNGOptions
}