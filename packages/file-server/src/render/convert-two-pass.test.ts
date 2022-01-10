import path from 'path'
import fs from 'fs'

import { RENDER_FOLDER, TEST_ASSETS } from '../../test-assets'

import { convertTwoPass } from './convert-two-pass'

describe('convertTwoPass', () => {

    it('converts video using two pass encoding', async () => {

        const input = TEST_ASSETS.mp4

        const output = path.join(RENDER_FOLDER, 'test-render-2pass.mp4')

        await convertTwoPass({
            input: input,
            output: output,
            vbr: 25
        })

        expect(fs.existsSync(output)).toEqual(true)

    })

})