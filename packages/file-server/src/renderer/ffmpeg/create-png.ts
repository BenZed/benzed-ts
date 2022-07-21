import ffmpeg from 'fluent-ffmpeg'

import { getMetadata } from './get-metadata'
import { getSize } from './util'
import {
    ImageOutputFormats,
    Input,
    Output,
    SizeOptions,
    TimeOptions
} from './options'

import { clamp } from '@benzed/math'
import { isDefined, isString } from '@benzed/is'

/*** Types ***/

type CreatePNGOptions =
    & Input
    & Output<ImageOutputFormats>
    & TimeOptions
    & SizeOptions

/*** Helper ***/

async function getTimeStamp(options: CreatePNGOptions): Promise<number> {

    const { input } = options
    const { duration, frameRate } = await getMetadata({ input })

    if (!isDefined(duration) || !isDefined(frameRate))
        return 0

    const frameDuration = 1 / frameRate
    const maxFrameDuration = duration - frameDuration

    if ('time' in options) {

        const { time } = options

        const timeStamp = time >= 0
            // from beginning
            ? clamp(time, 0, maxFrameDuration)
            // from end
            : clamp(duration + time, 0, maxFrameDuration)

        return timeStamp

    } else {

        const { progress } = options

        const timeStamp = clamp(progress * maxFrameDuration, 0, maxFrameDuration)
        return timeStamp
    }
}

/*** Main ***/

async function createPNG(options: CreatePNGOptions): Promise<number> {

    const { input, output } = options

    const cmd = ffmpeg(input)

    const timeStamp = await getTimeStamp(options)

    cmd.videoCodec('png')
        .seek(timeStamp)
        .frames(1)

    if (!isString(output))
        cmd.format('image2pipe')

    const size = getSize(options)
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