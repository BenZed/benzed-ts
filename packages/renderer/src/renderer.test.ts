import fs from 'fs'
import path from 'path'
import { cpus } from 'os'

import { $renderSetting } from './render-settings'
import { Renderer, RenderItem } from './renderer'

import { RENDER_FOLDER, TEST_ASSETS } from '../test-assets'
import { getMetadata, $metaData } from './ffmpeg'

import { floor } from '@benzed/math'
//
describe('construct', () => {
    it('throws if no render options are provided', () => {
        expect(() => new Renderer({ settings: {} }))
            .toThrow('requires at least one RenderSetting')
    })

    it('defaults maxConcurrent to number of processors - 1 if not provided', () => {

        const renderer = new Renderer({
            maxConcurrent: undefined,
            settings: {
                thumbnail: {
                    type: 'image'
                }
            }
        })

        expect(renderer.config.maxConcurrent).toEqual(cpus().length - 1)
    })

    it('throws if maxConcurrent is higher than the number of processors', () => {
        expect(() => new Renderer({
            maxConcurrent: cpus().length + 1,
            settings: {
                thumbnail: {
                    type: 'image'
                }
            }
        })).toThrow(`processors on this system (${cpus().length})`)
    })
})

describe('static from() method', () => {
    it('gets a render option from a json url', async () => {
        const renderer = await Renderer.from(TEST_ASSETS.config)
        expect($renderSetting.is(renderer.config.settings['image-low'])).toBe(true)
        expect($renderSetting.is(renderer.config.settings['image-medium'])).toBe(true)
        expect($renderSetting.is(renderer.config.settings['image-high'])).toBe(true)
    })

    it('throws if provided json is not formatted correctly', async () => {
        const err = await Renderer.from(TEST_ASSETS.badConfig).catch(e => e)

        expect(err.path).toEqual(['settings'])
        expect(err.message).toContain('is required')
    })
})

describe('add() method', () => {

    const MP4_SCALE = 0.25
    const PNG_SCALE = 0.25

    const config = {
        settings: {
            movie: {
                type: 'video' as const,
                vbr: 500,
                abr: 250,
                size: { scale: MP4_SCALE }
            },
            picture: {
                type: 'image' as const,
                size: { scale: PNG_SCALE },
                time: { progress: 0.5 }
            }
        }
    }

    const INPUT_SOURCE = TEST_ASSETS.mp4

    let renderer: Renderer
    let items: RenderItem[]
    beforeAll(async () => {
        renderer = new Renderer(config)

        items = renderer.add({
            source: INPUT_SOURCE,
            target: RENDER_FOLDER
        })

        await Promise.all(items.map(item => item.complete()))
    })

    it('creates an item for each render option', () => {

        const itemForEachRenderKey = Object
            .keys(renderer.config.settings)
            .every(key => items.find(item => item.setting === key))

        expect(itemForEachRenderKey).toEqual(true)
    })

    it('renders a file for each item in the queue', () => {

        const allItemsRendered = items
            .every(item =>
                fs.existsSync(item.output as string)
            )

        expect(allItemsRendered).toBe(true)
    })

    it('target as a method allows for control over output items as streams', async () => {

        const CUSTOM_PATH_PART = 'from-gif'

        const items = renderer.add({
            source: TEST_ASSETS.gif,
            target({ setting, ext }) {
                return path.join(
                    RENDER_FOLDER,
                    `${CUSTOM_PATH_PART}_${setting}${ext}`
                )
            }
        })

        await Promise.all(items.map(item => item.complete()))

        const allItemsUsedTargetMethod = items
            .every(item => item
                ?.output
                ?.toString()
                .includes(CUSTOM_PATH_PART)
            )

        expect(allItemsUsedTargetMethod).toBe(true)
    })

    it('settings options allows for render of only specific settings', async () => {

        const items = renderer.add({
            source: TEST_ASSETS.png,
            settings: ['picture'],
            target({ ext }) {
                return fs.createWriteStream(
                    path.join(
                        RENDER_FOLDER,
                        `only-picture-setting${ext}`
                    )
                )
            }
        })

        await Promise.all(items.map(item => item.complete()))

        expect(items.length).toBe(1)
        expect(items[0].setting).toBe('picture')
    })

    it('settings option throws if key does not exist', () => {
        expect(() => renderer.add({
            source: TEST_ASSETS.png,
            settings: ['bad-setting'],
            target: './no-where'
        })).toThrow('bad-setting is not a valid setting')
    })

    it('gets metadata results', () => {
        for (const item of items)
            expect($metaData.is(item.result?.value)).toBe(true)
    })

    it('size settings are respected', async () => {
        const [movie, image] = items

        const meta = await getMetadata({ input: INPUT_SOURCE })

        for (const dimensionKey of ['width', 'height'] as const) {
            const dimension = meta[dimensionKey] ?? 0

            expect(movie.result?.value?.[dimensionKey]).toBe(floor(dimension * MP4_SCALE, 2))
            expect(image.result?.value?.[dimensionKey]).toBe(floor(dimension * PNG_SCALE, 2))
        }
    })

})

it('stress test', async () => {

    const renderer = await Renderer.from(TEST_ASSETS.config)

    const items: RenderItem[] = []
    for (let i = 0; i < cpus().length / 2; i++) {
        items.push(
            ...renderer.add({
                source: TEST_ASSETS.mp4,
                target: ({ ext, setting }) =>
                    path.join(RENDER_FOLDER, `stress-test_${setting}_${i}${ext}`)
            })
        )
    }

    await expect(Promise.all(items.map(i => i.complete())))
        .resolves
        .toHaveLength(items.length)

})
