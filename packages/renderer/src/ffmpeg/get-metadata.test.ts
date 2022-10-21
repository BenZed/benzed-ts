import { TEST_ASSETS } from '../../test-assets'
import { getMetadata } from './get-metadata'

describe(`getMetadata`, () => {

    it(`Gets correct output data from pngs`, async () => {

        const output = await getMetadata({ input: TEST_ASSETS.png })
        expect(output).toEqual({
            width: 256,
            height: 256,
            duration: undefined,
            size: 85144,
            format: `png`
        })
    })

    it(`Gets correct output data from jpgs`, async () => {

        const output = await getMetadata({ input: TEST_ASSETS.jpg })
        expect(output).toEqual({
            width: 256,
            height: 256,
            duration: 0.04,
            frameRate: 25,
            size: 12906,
            format: `mjpeg`
        })
    })

    it(`Gets correct output data from gifs`, async () => {

        const output = await getMetadata({ input: TEST_ASSETS.gif })
        expect(output).toEqual({
            width: 96,
            height: 54,
            duration: 1.12,
            frameRate: 12.5,
            size: 51736,
            format: `gif`
        })
    })

    it(`Gets correct output data from mp4s`, async () => {

        const output = await getMetadata({ input: TEST_ASSETS.mp4 })
        expect(output).toEqual({
            width: 320,
            height: 180,
            duration: 1.042708,
            frameRate: 23.976,
            size: 248797,
            format: `h264`
        })
    })
})