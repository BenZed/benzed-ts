import { FileService } from '@benzed/feathers'

import type { FileServerApp } from '../create-file-server-app'

/*** Type Extensions ***/

declare module '../create-file-server-app' {

    interface FileServices {
        'files': FileService
    }

}

/*** Main ***/

export default function (app: FileServerApp): void {

    const files = new FileService(app)

    app.use('files', files)

    app.log`file service configured`
}
