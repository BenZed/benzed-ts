import { Writable, Readable } from 'stream'

/*** Input & Output ***/

export const AUDIO_OUTPUT_FORMATS = ['mp3']
export type AudioOutputFormats = (typeof AUDIO_OUTPUT_FORMATS)[number]

export const VIDEO_OUTPUT_FORMATS = ['mp4']
export type VideoOutputFormats = (typeof VIDEO_OUTPUT_FORMATS)[number]

export const IMAGE_OUTPUT_FORMATS = ['png']
export type ImageOutputFormats = (typeof IMAGE_OUTPUT_FORMATS)[number]

export type OutputFormats = AudioOutputFormats | VideoOutputFormats | ImageOutputFormats

export interface Input {

    input: string | Readable

}

export interface Output<F extends OutputFormats = OutputFormats> {

    output: string | Writable

    format?: F

}

/*** Encoding ***/

export interface VideoOptions {

    /**
     * Video Bit Rate
     */
    vbr?: number

    /**
     * Frames Per Second
     */
    fps?: number

}

export interface AudioOptions {

    /**
     * Audio Bit Rate
     */
    abr?: number

}

/*** Dimensions ***/

export type Height = { height: number }

export type Width = { width: number }

export type Duration = { duration: number }

export type SizeOptions =
    | Height
    | Width
    | (Height & Width)
    | { dimension?: number | `${number}%` }

/*** Selection ***/

export type TimeOptions = {

    /**
     * Time, in seconds, corresponding to
     * a point in a stream.
     * 
     * Negative values will be interpreted 
     * as a timestamp counting from the end 
     * of the stream.
     */
    time: number

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
