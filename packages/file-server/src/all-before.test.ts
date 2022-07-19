import fs from 'fs'
import { RENDER_FOLDER } from '../test-assets'

export default async (): Promise<void> => {

    // Remove Render Folder
    await new Promise<void>(resolve =>
        fs.rm(
            RENDER_FOLDER,
            { recursive: true },
            () => resolve()
        )
    )

    // Make Render Folder
    await new Promise<void>(resolve =>
        fs.mkdir(
            RENDER_FOLDER,
            () => resolve()
        )
    )

}