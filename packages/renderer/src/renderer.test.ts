import { isRenderOptions } from './render-options'
import Renderer from './renderer'

describe('construct', () => {

    it('throws if no render options are provided', () => {
        expect(() => new Renderer({}))
            .toThrow('requires at least one RenderOption')
    })

})

describe('static from() method', () => {

    it('gets a render option from a json url', async () => {

        const renderer = await Renderer.from('./test-assets/render-options.json')

        expect(isRenderOptions(renderer.options['image-low'])).toBe(true)
        expect(isRenderOptions(renderer.options['image-medium'])).toBe(true)
        expect(isRenderOptions(renderer.options['image-high'])).toBe(true)
    })

    it('throws if provided json is not formatted correctly', async () => {
        await expect(Renderer.from('./test-assets/render-options-bad.json'))
            .rejects
            .toThrow('not a valid RendererOptions object')
    })

})

describe('add() method', () => {

    it('adds a render job to the queue', async () => {
        const renderer = await Renderer.from('./test-assets/render-options.json')

        renderer.add({
            in: './test-assets/boss-media-pneumonic.mp4',
            out: './test-assets/renders'
        })

    })

})