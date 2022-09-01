
import {
    isSizeOptions,
    isTimeOptions,
    isAudioOptions,
    isVideoOptions,
    SizeOptions,
    TimeOptions,
    VideoOptions,
    AudioOptions,
} from './ffmpeg/options'

import {
    enumOf,
    or,
    and,
    shapeOf,
    recordOf,
    optional,
    ValidatesType,
    Validator,
    assertify
} from './validator'

/*** Type ***/

const hasType = <S extends string>(type: S): Validator<{ type: S }> =>
    shapeOf({
        type: enumOf(type)
    })

export interface AudioRenderOptions extends AudioOptions {
    type: 'audio'
}
const isAudioRenderOptions: Validator<AudioRenderOptions> = and(
    hasType('audio'),
    isAudioOptions
)

export interface VideoRenderOptions extends VideoOptions, AudioOptions {
    type: 'video'
}
const isVideoRenderOptions: Validator<VideoRenderOptions> = and(
    hasType('video'),
    isVideoOptions,
    isAudioOptions,
)

export interface ImageRenderOptions {
    type: 'image'
    size?: SizeOptions
    time?: TimeOptions
}
const isImageRenderOptions: Validator<ImageRenderOptions> = shapeOf({
    type: enumOf('image'),
    size: optional(isSizeOptions),
    time: optional(isTimeOptions)
})

/*** Expots ***/

export type RenderOptions = ValidatesType<typeof isRenderOptions>
export const isRenderOptions = or(
    isAudioRenderOptions,
    isVideoRenderOptions,
    isImageRenderOptions
)

export interface RendererOptions {
    [key: string]: RenderOptions
}
export const isRendererOptions: Validator<RendererOptions> = recordOf(isRenderOptions)

export const assertRendererOptions = assertify(
    isRendererOptions,
    'not a valid RendererOptions object'
)