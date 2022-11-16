import ffmpeg, { FfprobeData, FfprobeStream } from 'fluent-ffmpeg'

import {
    Duration,
    Width,
    Height,
    Input
} from './settings'

import { isNaN, isString } from '@benzed/is'
import { priorityFind } from '@benzed/array'
import { round } from '@benzed/math'
import $ from '@benzed/schema'

//// Type ////

interface Metadata extends Partial<Width>, Partial<Height>, Partial<Duration> {
    format?: string
    size?: number | 'N/A'
    frameRate?: number
}

interface RenderMetadata extends Metadata {
    renderTime: number
}

const $metaData = $.shape({
    width: $.number.optional,
    height:$.number.optional,
    duration: $.number.optional,
    format: $.string.optional,
    size: $.or($.number, $('N/A')).optional,
    frameRate: $.number.optional
})

type GetMetadataOptions = Input

//// Helper ////

function parseOutputDuration(
    stream: FfprobeStream,
): number | undefined {

    const duration = isString(stream.duration)
        ? parseFloat(stream.duration)
        : stream.duration

    return isNaN(duration) ? undefined : duration
}

function parseOutputFrameRate(
    stream: FfprobeStream
): number | undefined {

    // So that we're not returning a framerate on streams that 
    // don't have a duration.
    const duration = parseOutputDuration(stream)
    if (!duration)
        return undefined

    const frameRateFraction = stream.avg_frame_rate
    if (!frameRateFraction)
        return undefined

    const [numerator, denominator] = frameRateFraction.split('/').map(parseFloat)

    const frameRate = numerator / denominator
    return isNaN(frameRate) ? undefined : round(frameRate, 0.001)

}

//// Main ////

async function getMetadata(
    options: GetMetadataOptions
): Promise<Metadata> {

    const { input } = options

    // Probe source
    const probed = await new Promise<FfprobeData>((resolve, reject) =>
        ffmpeg(input).ffprobe((err, probed) => err
            ? reject(err)
            : resolve(probed)
        )
    )

    // Get stream
    const stream = priorityFind(
        probed.streams,
        stream => stream.codec_type === 'video',
        stream => stream.codec_type === 'audio'
    )
    if (!stream) {
        throw new Error(
            'Could not get relevent streams from source.'
        )
    }

    const { width, height } = stream

    return {
        width,
        height,
        size: probed.format.size,
        format: stream.codec_name,
        duration: parseOutputDuration(stream),
        frameRate: parseOutputFrameRate(stream)
    }
}

//// Exports ////

export default getMetadata

export {
    getMetadata,
    GetMetadataOptions,

    Metadata,
    $metaData,

    RenderMetadata
}