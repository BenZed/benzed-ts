
import { Writable } from 'stream'
import path from 'path'

import {
    assertRendererOptions,
    RendererOptions,
    RenderOptions
} from './render-options'

import { createMP3, createMP4, createPNG } from './ffmpeg'
import { Input, Output } from './ffmpeg/options'

import { Queue, QueueItem } from '@benzed/async'
import { isString } from '@benzed/is'
import fs from '@benzed/fs'

/*** Constants ***/

const EXT = {
    audio: '.mp3',
    video: '.mp4',
    image: '.png'
} as const

/**
 * Given a file name and render option key, return a writable stream or 
 * a location on the local file system to write the rendered file.
 */
type TargetMethod = (
    fileName: string,
    extension: string,
    renderOptionKey: string
) => Writable | string

interface AddRenderTaskOptions {
    /**
     * Source file or stream
     */
    readonly source: Input['input']

    /**
     * TargetMethod or a path to a target directory 
     */
    readonly target: string | TargetMethod
}

interface RenderTaskResult extends Output {

    /**
     * Render option that was used to create this task
     */
    readonly key: string

    /**
     * Time it took to complete the render
     */
    readonly time: number
}

type RenderTask = () => Promise<RenderTaskResult>

/*** Helper ***/

function getOutput(
    options: AddRenderTaskOptions,
    type: RenderOptions['type'],
    key: string
): Output['output'] {

    const { source, target } = options

    const baseName = isString(source)
        ? path.basename(source, path.extname(source))
        : Date.now().toString()

    const ext = EXT[type]

    const output = isString(target)
        ? path.join(target, `${baseName}_${key}${ext}`)
        : target(baseName, ext, key)

    return output
}

function createRenderTask(
    key: string,
    addOptions: AddRenderTaskOptions,
    renderOptions: RenderOptions
): RenderTask {

    const { source: input } = addOptions
    const { type } = renderOptions

    const output = getOutput(addOptions, type, key)

    switch (type) {
        case 'image':

            const { time, size } = renderOptions

            return () => createPNG({
                ...time,
                ...size,
                input,
                output
            }).then(time => ({ time, key, output }))

        case 'audio':
            return () => createMP3({
                ...renderOptions,
                input,
                output
            }).then(time => ({ time, key, output }))

        case 'video':
            return () => createMP4({
                ...renderOptions,
                input,
                output
            }).then(time => ({ time, key, output }))

        default: {
            const badType: never = type
            throw new Error(
                `${badType} is not a valid render options type.`
            )
        }
    }
}

/*** Main ***/

class Renderer {

    private readonly _queue: Queue<RenderTaskResult> = new Queue()

    public readonly options: RendererOptions

    /**
     * Create a render instance from a json config.
     */
    public static async from(configUrl: string): Promise<Renderer> {

        const options = await fs.readJson(
            configUrl,
            assertRendererOptions
        )

        return new Renderer(options)
    }

    public constructor (options: RendererOptions) {

        const numOptions = Object
            .keys(options)
            .length

        if (numOptions === 0)
            throw new Error('requires at least one RenderOption')

        this.options = {
            ...options
        }
    }

    public add(addOptions: AddRenderTaskOptions): QueueItem<RenderTaskResult>[] {

        const renderItems: QueueItem<RenderTaskResult>[] = []

        for (const key in this.options) {

            const renderOptions = this.options[key]
            const renderTask = createRenderTask(key, addOptions, renderOptions)
            const renderItem = this._queue.add(renderTask)

            renderItems.push(renderItem)
        }

        return renderItems
    }

}

/*** Exports ***/

export default Renderer

export {
    Renderer,
    RenderTask,
    RenderTaskResult
}