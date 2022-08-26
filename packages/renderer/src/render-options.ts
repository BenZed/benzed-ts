
import {
    isSizeOptions,
    isTimeOptions,
    isAudioOptions,
    isVideoOptions,
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
    shapeOf({ type: enumOf(type) })

export type AudioRenderOptions = ValidatesType<typeof isAudioRenderOptions>
const isAudioRenderOptions = and(
    hasType('audio'),
    isAudioOptions
)

export type VideoRenderOptions = ValidatesType<typeof isVideoRenderOptions>
const isVideoRenderOptions = and(
    hasType('video'),
    isVideoOptions,
    isAudioOptions,
)

export type ImageRenderOptions = ValidatesType<typeof isImageRenderOptions>
const isImageRenderOptions = shapeOf({
    type: enumOf('image'),
    size: optional(isSizeOptions),
    time: optional(isTimeOptions)
})

/*** Expots ***/

export interface RendererOptions {
    [key: string]: RenderOptions
}

export type RenderOptions = ValidatesType<typeof isRendererOption>
export const isRendererOption = or(
    isAudioRenderOptions,
    isVideoRenderOptions,
    isImageRenderOptions
)

export const isRendererOptions = recordOf(isRendererOption)

export const assertRendererOptions = assertify(
    isRendererOption,
    'input is not a valid RendererOptions object.'
)