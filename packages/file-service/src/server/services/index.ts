import type { FileServerApp } from '../create-file-server-app'

import setupAuthenticationService, { AuthenticationService } from './authentication'

import setupFileService, { FileService } from './files'
import { RenderService } from './files/render'
import setupUserService, { UserService } from './users'

export interface FileServices {

    'authentication': AuthenticationService
    'users': UserService
    'files': FileService
    'files/render': RenderService

}

/*** Main ***/

export default function setupFileServices(app: FileServerApp): void {

    setupUserService(app)

    const auth = setupAuthenticationService(app)

    setupFileService(
        app,
        auth,
        {
            path: '/files',
            s3: app.get('s3'),
            fs: app.get('fs'),
            pagination: app.get('pagination'),
            renderer: app.get('renderer')
        }
    )
}
