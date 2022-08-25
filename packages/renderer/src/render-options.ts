import {
    isDefined,
    isNumber,
    isObject
} from '@benzed/is'

import {
    VideoOptions,
    AudioOptions,
    SizeOptions,
    isSizeOptions,
    TimeOptions,
    isTimeOptions,
    isObjectWithOptionalProperty
} from './ffmpeg/options'

/*** Type ***/

type AudioRenderOptions = { type: 'audio' } & AudioOptions

type VideoRenderOptions = { type: 'video', size?: SizeOptions } & VideoOptions & AudioOptions

type ImageRenderOptions = { type: 'image', size?: SizeOptions, time?: TimeOptions }

/*** Expots ***/

export type RenderOptions = AudioRenderOptions | VideoRenderOptions | ImageRenderOptions

export interface RendererOptions {
    [key: string]: RenderOptions
}

export function isRendererOption(input: unknown): input is RenderOptions {
    if (!isObject<Partial<RenderOptions>>(input))
        return false

    const isVideo = input.type === 'video'
    if (isVideo && (!isObjectWithOptionalProperty(input.vbr) || !isObjectWithOptionalProperty(input.fps)))
        return false

    const isAudio = input.type === 'audio'
    if ((isAudio || isVideo) && !isObjectWithOptionalProperty(input.abr))
        return false

    const isImage = input.type === 'image'
    if ((isVideo || isImage) && !isSizeOptions(input.size))
        return false

    if (isImage && !isTimeOptions(input.time))
        return false

    return true
}

export function isRendererOptions(input: unknown): input is RendererOptions {
    return isObject(input) &&
        Object
            .values(input)
            .every(isRendererOption)
}

export function assertRendererOptions(input: unknown): asserts input is RendererOptions {
    if (!isRendererOptions(input))
        throw new Error('input is not a valid RendererOptions object.')
}
