import type { Writable, Readable } from 'stream'

import $ from '@benzed/schema'

//// IO ////
export interface Input {
    input: string | Readable
}

export interface Output {
    output: string | Writable
}

//// Dimensions ////

export type Height = {
    height: number
}

export type Width = {
    width: number
}

export type Duration = {
    duration: number
}

//// Options ////

export interface VideoSetting {

    /**
     * Video Bit Rate
     */
    vbr?: number

    /**
     * Frames Per Second
     */
    fps?: number

}

export const $videoSetting = $.shape({
    vbr: $.number.optional,
    fps: $.number.optional
})

export interface AudioSetting {

    /**
     * Audio Bit Rate
     */
    abr?: number

}

export const $audioSetting = $.shape({
    abr: $.number.optional
})

export type SizeSetting =
    | Height
    | Width
    | (Height & Width)
    | {
        /**
         * Pixel dimensions of both width and height.
         */
        dimensions: number
    }
    | {
        /**
         * Width and height will scale according to their input by this value.
         */
        scale: number
    }

export const $sizeSetting = $.or(
    $({ height: $.number }),
    $({ width: $.number }),
    $({ dimensions: $.number }),
    $({ scale: $.number })
)

export type TimeSetting = {

    /**
     * Time, in seconds, corresponding to
     * a point in a stream.
     * 
     * Negative values will be interpreted 
     * as a timestamp counting from the end 
     * of the stream.
     */
    seconds: number

} | {

    /**
     * A value between 0-1 that maps to the 
     * duration of a stream.
     * 
     * 0.5, for example, would be halfway
     * through the stream.
     */
    progress: number
}

export const $timeSetting = $.or(
    $({ seconds: $.number }),
    $({ progress: $.number })
)
