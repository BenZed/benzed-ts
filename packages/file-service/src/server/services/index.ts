import type { FileServerApp } from '../create-file-server-app'

import setupAuthenticationService, { AuthenticationService } from './authentication'

import setupUserService, { UserService } from './users'
import setupFileService, { FileService } from './files'
import { RenderService } from './files/render'

export interface FileServices {

    'users': UserService
    'files': FileService
    'files/render': RenderService
    'authentication': AuthenticationService

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
