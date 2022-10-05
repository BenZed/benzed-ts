
import $ from '@benzed/schema'

import {

    $sizeSetting,
    SizeSetting,

    $timeSetting,
    TimeSetting,

    $audioSetting,
    AudioSetting,

    $videoSetting,
    VideoSetting

} from './ffmpeg/settings'

/*** Type ***/

export interface AudioRenderSetting extends AudioSetting {
    type: 'audio'
}
const $audioRenderSetting =
    $({
        type: $.enum('audio' as const),
        ...$audioSetting.$
    })

export interface VideoRenderSetting extends VideoSetting, AudioSetting {
    type: 'video'
    size?: SizeSetting
}

const $videoRenderSetting = $({
    type: $('video' as const),
    ...$videoSetting.$,
    ...$audioSetting.$,
    size: $sizeSetting.optional

})

export interface ImageRenderSetting {
    type: 'image'
    size?: SizeSetting
    time?: TimeSetting
}
const $imageRenderSetting = $({
    type: $('image' as const),
    size: $sizeSetting.optional,
    time: $timeSetting.optional
})

/*** Expots ***/

export type RenderSetting = AudioRenderSetting | VideoRenderSetting | ImageRenderSetting
export const $renderSetting = $.or(
    $audioRenderSetting,
    $videoRenderSetting,
    $imageRenderSetting
)

export interface RendererConfig {
    readonly maxConcurrent?: number
    readonly settings: {
        readonly [key: string]: RenderSetting
    }
}

export const $rendererConfig = $({
    maxConcurrent: $.number.optional,
    settings: $.record($renderSetting)
})
