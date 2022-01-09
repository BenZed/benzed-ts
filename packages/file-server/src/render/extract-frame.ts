import ffmpeg from 'fluent-ffmpeg'

import { Readable, Writable } from 'stream'
import { getMetadata } from './get-metadata'

import { clamp } from '@benzed/math'

/*** Types ***/

type ExtractFrameOptions = {

    input: string | Readable
    output: string | Writable

} & ({

    /**
        * Time, in seconds, in the video where 
        * the frame should be extract from.
        * 
        * Negative values will be interpreted 
        * as a timestamp counting from the end 
        * of the video.
        */
    time: number

} | {

    /**
        * A value between 0-1 that corresponds to 
        * a 
        */
    progress: number
})

/*** Helper ***/

async function getTimestamp(options: ExtractFrameOptions): Promise<number> {

    const { input } = options
    const { duration } = await getMetadata({ source: input })

    if ('time' in options) {

        const { time } = options
        return time >= 0

            // from beginning
            ? clamp(time, 0, duration)

            // from end
            : clamp(duration + time, 0, duration)

    } else {

        const { progress } = options

        return clamp(progress) * duration
    }
}

/*** Main ***/

async function extractFrame(options: ExtractFrameOptions): Promise<number> {

    const { input, output } = options

    const timeStamp = await getTimestamp(options)

    const start = Date.now()

    await new Promise((resolve, reject) => ffmpeg(input)
        .addInputOption([
            `-ss ${timeStamp}`,
            '-vframes 1',
            '-y'
        ])
        .on('end', resolve)
        .on('error', reject)
        .output(output)
        .run()
    )

    const renderTime = Date.now() - start
    return renderTime
}

/*** Exports ***/

export default extractFrame

export {
    extractFrame,
    ExtractFrameOptions
}