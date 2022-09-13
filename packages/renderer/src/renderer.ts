
import path from 'path'

import {
    assertRenderSettings,
    RenderSettings,
    RenderSetting
} from './render-settings'

import {
    createMP3,
    createMP4,
    createPNG,
    RenderMetadata
} from './ffmpeg'

import { Input, Output } from './ffmpeg/settings'

import { Queue, QueueItem } from '@benzed/async'
import { StringKeys } from '@benzed/util'
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
type TargetMethod = <R extends RenderSettings = RenderSettings>(
    data: {
        fileName: string
        ext: string
        setting: StringKeys<R>
    }
) => Output['output']

interface AddRenderTaskOptions<R extends RenderSettings = RenderSettings> {
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
    readonly settings?: StringKeys<R>[]
}

type RenderTask = () => Promise<RenderMetadata>

/*** Helper ***/

function getOutput<R extends RenderSettings>(
    options: AddRenderTaskOptions<R>,
    type: RenderSetting['type'],
    setting: StringKeys<R>
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

function createRenderTask<R extends RenderSettings>(
    addOptions: AddRenderTaskOptions<R>,
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

/*** Main ***/

interface RenderItem<R extends RenderSettings = RenderSettings>
    extends QueueItem<RenderMetadata>, Input, Output {

    /**
     * Render option that was used to create this task
     */
    readonly setting: StringKeys<R>

}

class Renderer<R extends RenderSettings = RenderSettings> {

    private readonly _queue: Queue<RenderMetadata> = new Queue()

    public readonly settings: R

    /**
     * Create a render instance from a json config.
     */
    public static async from(configUrl: string): Promise<Renderer<RenderSettings>> {

        const options = await fs.readJson(
            configUrl,
            assertRenderSettings
        )

        return new Renderer(options)
    }

    public constructor (settings: R) {

        const numOptions = Object
            .keys(settings)
            .length

        if (numOptions === 0)
            throw new Error('requires at least one RenderSetting')

        this.settings = { ...settings }
    }

    public add(
        addOptions: AddRenderTaskOptions<R>,
    ): RenderItem<R>[] {

        const renderItems: RenderItem<R>[] = []

        const settingMask =
            addOptions.settings ??
            Object.keys(this.settings) as StringKeys<R>[]

        for (const setting in this.settings) {

            if (!settingMask.includes(setting))
                continue

            const renderSettings = this.settings[setting]

            const output = getOutput(addOptions, renderSettings.type, setting)

            const renderTask = createRenderTask(addOptions, renderSettings, output)
            const queueItem = this._queue.add(renderTask)

            const renderItem: RenderItem<R> = Object.assign(queueItem, {
                input: addOptions.source,
                output,
                setting
            })

            renderItems.push(renderItem)
        }

        return renderItems
    }

}

/*** Exports ***/

export default Renderer

export {
    Renderer,
    RenderItem,

    RenderTask,
    AddRenderTaskOptions
}