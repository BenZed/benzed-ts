import path from 'path'
import fs from 'fs'

import { RENDER_FOLDER, TEST_ASSETS } from '../../test-assets'

import { createMP4 } from './create-mp4'

describe('createMp4', () => {

    it('converts video using two pass encoding', async () => {

        const input = TEST_ASSETS.mp4

        const output = path.join(RENDER_FOLDER, 'test-render-2pass.mp4')

        await createMP4({
            input,
            output,
            vbr: 25
        })

        expect(fs.existsSync(output)).toEqual(true)
    })
})