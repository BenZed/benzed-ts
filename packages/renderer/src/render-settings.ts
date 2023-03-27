
import is, { Or, Optional, ReadOnly, IsType } from '@benzed/is'

import {

    isSizeSetting,
    SizeSetting,

    isTimeSetting,
    TimeSetting,

    isAudioSetting,
    AudioSetting,

    isVideoSetting,
    VideoSetting

} from './ffmpeg/settings'

//// Type ////

export interface AudioRenderSetting extends AudioSetting {
    type: 'audio'
}
const isAudioRenderSetting: IsType<AudioRenderSetting> =
    is({
        type: 'audio' as const,
        ...isAudioSetting.properties
    })

export interface VideoRenderSetting extends VideoSetting, AudioSetting {
    type: 'video'
    size?: SizeSetting
}

const isVideoRenderSetting: IsType<VideoRenderSetting> = is({
    type: 'video' as const,
    ...isVideoSetting.properties,
    ...isAudioSetting.properties,
    size: isSizeSetting.optional

})

export interface ImageRenderSetting {
    type: 'image'
    size?: SizeSetting
    time?: TimeSetting
}
const isImageRenderSetting: IsType<ImageRenderSetting> = is({
    type: 'image' as const,
    size: isSizeSetting.optional,
    time: isTimeSetting.optional
})

//// Expots ////

export type RenderSetting = AudioRenderSetting | VideoRenderSetting | ImageRenderSetting
export const isRenderSetting = is(
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

export const isRenderConfig = is({
    maxConcurrent: is.number.above(0).optional,
    settings: is.recordOf(is.string, isRenderSetting)
})
