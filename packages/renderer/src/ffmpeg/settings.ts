import type { Writable, Readable } from 'stream'

import is, { Or, Optional } from '@benzed/is'

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

export const isVideoSetting = is({
    vbr: is.number.optional,
    fps: is.number.optional
})

export interface AudioSetting {

    /**
     * Audio Bit Rate
     */
    abr?: number

}

export const isAudioSetting = is({
    abr: is.number.optional
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

export const isSizeSetting = is(
    { height: is.number },
    { width: is.number },
    {
        height: is.number,
        width: is.number 
    },
    { dimensions: is.number },
    { scale: is.number }
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

export const isTimeSetting = is(
    { seconds: is.number },
    { progress: is.number }
)
