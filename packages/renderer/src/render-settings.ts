
import { isNumber } from '@benzed/is/lib'
import {
    isSizeSetting,
    isTimeSetting,
    isAudioSetting,
    isVideoSetting,
    SizeSetting,
    TimeSetting,
    VideoSetting,
    AudioSetting,
} from './ffmpeg/settings'

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

export interface AudioRenderSetting extends AudioSetting {
    type: 'audio'
}
const isAudioRenderSetting: Validator<AudioRenderSetting> = and(
    hasType('audio'),
    isAudioSetting
)

export interface VideoRenderSetting extends VideoSetting, AudioSetting {
    type: 'video'
    size?: SizeSetting
}

const isVideoRenderSetting: Validator<VideoRenderSetting> = and(
    hasType('video'),
    isVideoSetting,
    isAudioSetting,
    shapeOf({
        size: optional(isSizeSetting)
    })
)

export interface ImageRenderSetting {
    type: 'image'
    size?: SizeSetting
    time?: TimeSetting
}
const isImageRenderSetting: Validator<ImageRenderSetting> = shapeOf({
    type: enumOf('image'),
    size: optional(isSizeSetting),
    time: optional(isTimeSetting)
})

/*** Expots ***/

export type RenderSetting = ValidatesType<typeof isRenderSetting>
export const isRenderSetting = or(
    isAudioRenderSetting,
    isVideoRenderSetting,
    isImageRenderSetting
)

export interface RendererConfig {
    readonly maxConcurrent?: number
    readonly settings: {
        readonly [key: string]: RenderSetting
    }
}

export const isRendererConfig: Validator<RendererConfig> = shapeOf({
    maxConcurrent: optional(isNumber),
    settings: recordOf(isRenderSetting)
})

export const assertRenderConfig = assertify(
    isRendererConfig,
    'not a valid RenderConfig object'
)