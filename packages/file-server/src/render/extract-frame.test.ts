import path from 'path'
import fs from 'fs'

import { RENDER_FOLDER, TEST_ASSETS } from '../../test-assets'

import { extractFrame } from './extract-frame'

describe('extractFrame', () => {

    for (const { progress, label } of [
        { progress: 0, label: 'beginning' },
        { progress: 0.5, label: 'middle' },
        { progress: 1, label: 'end' },
    ]) {
        it(`extracts a frame from the ${label} of input stream`, async () => {

            const input = TEST_ASSETS.mp4

            const output = path.join(RENDER_FOLDER, `test-render-progress-${progress}.png`)

            await extractFrame({
                input: input,
                output: output,
                progress
            })

            expect(fs.existsSync(output)).toEqual(true)

        })
    }

})