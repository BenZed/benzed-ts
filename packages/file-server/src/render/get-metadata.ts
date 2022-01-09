import { Readable } from 'stream'
import os from 'os'
import path from 'path'

import ffmpeg, { FfprobeData, FfprobeStream } from 'fluent-ffmpeg'

import { isNumber, isString } from '@benzed/is'
import { priorityFind } from '@benzed/array'

import { convertVideo } from './convert-video'
import unlink from './unlink'

/*** Type ***/

type Duration = {
    duration: number
}

type MetaData<Audio extends boolean = false> = Audio extends true
    ? Duration
    : Duration & {
        height: number
        width: number
    }

interface GetMetaDataOptions<A> {
    audio?: A
    source: string | Readable
}

/*** Helper ***/

/**
 * Couldn't come up with another way to get the duration of a .gif
 */
async function getGifDuration(source: string | Readable): Promise<number> {
    const tmpVideo = path.join(os.tmpdir(), `${Date.now()}.mp4 `)

    await convertVideo({
        input: source,
        output: tmpVideo,

        // video quality is 
        vbr: 4,
        dimension: 4,
    })

    const { duration } = await getMetadata({ source: tmpVideo })

    await unlink(tmpVideo)

    return duration
}

async function getDuration(
    source: string | Readable,
    stream: FfprobeStream
): Promise<number | undefined> {

    const isGif = stream.codec_name === 'gif'

    const duration = isGif
        ? await getGifDuration(source)

        : isString(stream.duration)
            ? parseFloat(stream.duration)
            : stream.duration

    return duration

}

/*** Main ***/

async function getMetadata<Audio extends boolean>(
    options: GetMetaDataOptions<Audio>
): Promise<MetaData<Audio>> {

    const { source, audio = false } = options

    // Probe source
    const probed = await new Promise<FfprobeData>((resolve, reject) =>
        ffmpeg(source).ffprobe((err, probed) => err
            ? reject(err)
            : resolve(probed)
        )
    )

    // Get stream
    const stream = priorityFind(probed.streams,
        stream => stream.codec_type === 'video',
        stream => stream.codec_type === 'audio'
    )
    if (!stream) {
        throw new Error(
            'Could not get relevent streams from source.'
        )
    }

    const duration = await getDuration(source, stream)
    if (!isNumber(duration)) {
        throw new Error(
            'Could not get duration from source.'
        )
    }

    const { width, height } = stream
    if (!audio && (!isNumber(width) || !isNumber(height))) {
        throw new Error(
            'Could not get dimensions from source.'
        )
    }

    return (
        audio ? { duration } : { width, height, duration }
    ) as MetaData<Audio>

}

/*** Exports ***/

export default getMetadata

export {
    getMetadata,
    GetMetaDataOptions,

    MetaData
}