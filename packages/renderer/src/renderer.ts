
import path from 'path'
import { cpus } from 'os'

import {
    $rendererConfig,
    RendererConfig,
    RenderSetting
} from './render-settings'

import {
    createMP3,
    createMP4,
    createPNG,
    RenderMetadata
} from './ffmpeg'

import { Input, Output } from './ffmpeg/settings'

import fs from '@benzed/fs'
import { isString } from '@benzed/is'
import { Queue, QueueItem } from '@benzed/async'
import { pass } from '@benzed/util'

//// Constants ////

const EXT = {
    audio: '.mp3',
    video: '.mp4',
    image: '.png',
    //
} as const

/**
 * Given a file name and render option key, return a writable stream or 
 * a location on the local file system to write the rendered file.
 */
export type TargetMethod = (
    data: {
        fileName: string
        ext: string
        setting: string
    }
) => Output['output']

interface AddRenderItemOptions {

    readonly id?: string | number

    /**
     * Source file or stream
     */
    readonly source: Input['input']

    /**
     * TargetMethod or a path to a target directory 
     */
    readonly target: string | TargetMethod

    /**
     * Render specific settings
     */
    readonly settings?: string[]
}

type RenderTask = () => Promise<RenderMetadata>

interface RenderData
    extends Input, Output {
    id?: string | number
    setting: string
}

type RenderItem =
    QueueItem<RenderMetadata, RenderData>

//// Helper ////

function getOutput(
    options: AddRenderItemOptions,
    type: RenderSetting['type'],
    setting: string
): Output['output'] {

    const { source, target } = options

    const fileName = isString(source)
        ? path.basename(source, path.extname(source))
        : Date.now().toString()

    const ext = EXT[type]

    const output = isString(target)
        ? path.join(target, `${fileName}_${setting}${ext}`)
        : target({ fileName, ext, setting })

    return output
}

//// Main ////

class Renderer {

    private readonly _queue: Queue<RenderMetadata, RenderData>

    readonly config: Required<RendererConfig>

    /**
     * Create a render instance from a json config.
     */
    static async from(configUrl: string): Promise<Renderer> {

        const options = await fs.readJson(
            configUrl,
            $rendererConfig.assert
        )

        return new Renderer(options)
    }

    constructor (config: RendererConfig) {

        const numOptions = Object
            .keys(config.settings)
            .length

        if (numOptions === 0)
            throw new Error('requires at least one RenderSetting')

        const numCpus = cpus().length

        const { maxConcurrent = numCpus - 1, settings } = config

        if (maxConcurrent > numCpus) {
            throw new Error(
                'config.maxConcurrent cannot be higher ' +
                'than the number of processors on this system ' +
                `(${numCpus})`
            )
        }

        this._queue = new Queue({ maxConcurrent, maxListeners: Infinity })
        this.config = { settings, maxConcurrent }
    }

    /**
     * Returns true if the render queue is complete
     */
    get isComplete(): boolean {
        return this._queue.isComplete
    }

    /**
     * Returns a promise that fulfills when the queue completes.
     */
    complete(): Promise<void> {
        return this._queue.complete()
    }

    /**
     * Total number of files being rendered.
     */
    count(): number {
        return this._queue.numTotalItems
    }

    /**
     * 
     */
    add(
        addOptions: AddRenderItemOptions,
    ): RenderItem[] {

        const renderItems: RenderItem[] = []

        const settings = Object.keys(this.config.settings)

        const settingMask = addOptions.settings ?? settings

        const badSetting = settingMask.find(setting => !settings.includes(setting))
        if (badSetting)
            throw new Error(`${badSetting} is not a valid setting, must be one of: ${settings}`)

        for (const setting of settings) {

            if (!settingMask.includes(setting))
                continue

            const renderSettings = this.config.settings[setting]

            const output = getOutput(addOptions, renderSettings.type, setting)

            const renderTask = this._createRenderTask(
                addOptions, 
                renderSettings,
                output
            )

            const renderItem = this._queue.add({
                task: renderTask,
                id: addOptions.id,
                setting,
                input: addOptions.source,
                output,
            })

            renderItems.push(renderItem)
        }

        return renderItems
    }

    items(
        predicate: (item: RenderItem) => boolean = pass
    ): RenderItem[] {
        return [
            ...this._queue.queuedItems,
            ...this._queue.currentItems
        ].filter(predicate)
    }

    /**
     * 
     */
    protected _createRenderTask(
        addOptions: AddRenderItemOptions,
        renderSetting: RenderSetting,
        output: Output['output']
    ): RenderTask {

        const { source: input } = addOptions
        const { type } = renderSetting

        switch (type) {

            case 'image': {

                const { time, size } = renderSetting

                return () => createPNG({
                    ...time,
                    ...size,
                    input,
                    output
                })
            }

            case 'video': {

                const { size } = renderSetting

                return () => createMP4({
                    ...renderSetting,
                    ...size,
                    input,
                    output
                })
            }

            case 'audio':
                return () => createMP3({
                    ...renderSetting,
                    input,
                    output
                })

            default: {
                const badType: never = type
                throw new Error(
                    `${badType} is not a valid render options type.`
                )
            }
        }
    }
}

//// Exports ////

export default Renderer

export {
    Renderer,
    RendererConfig,

    RenderItem,
    AddRenderItemOptions,

    RenderTask,
}