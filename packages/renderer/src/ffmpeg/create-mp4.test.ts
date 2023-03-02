import path from 'path'
import fs from 'fs'

import { RENDER_FOLDER, TEST_ASSETS } from '../../test-assets'

import { createMP4 } from './create-mp4'
import { it, expect } from '@jest/globals'

import { $metaData } from './get-metadata'

//// Setup ////

const input = TEST_ASSETS.mp4

//// Tests ////

it('converts video', async () => {

    const output = path.join(RENDER_FOLDER, 'test-render.mp4')

    //
    await createMP4({
        input,
        output,
        vbr: 250
    })

    expect(fs.existsSync(output)).toEqual(true)
})

it('receives metadata from render', async () => {

    const output = fs.createWriteStream(
        path.join(RENDER_FOLDER, 'test-render-for-meta.mp4')
    )

    const meta = await createMP4({ input, output })

    expect($metaData.is(meta)).toBe(true)

})