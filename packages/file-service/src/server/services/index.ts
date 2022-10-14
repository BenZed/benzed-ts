import type { FileServerApp } from '../create-file-server-app'

import setupAuthenticationService, { AuthenticationService } from './authentication'

import setupUserService, { UserService } from './users'
import setupFileService, { FileService } from './files'
import setupRenderService, { RenderService } from './render'

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

    const files = setupFileService(
        {
            app,
            auth,
            
            path: '/files',
            s3: app.get('s3'),
            fs: app.get('fs'),
            pagination: app.get('pagination')
        }
    )

    const renderer = app.get('renderer')
    if (renderer) {
        setupRenderService(
            {
                app,
                files,
                auth,

                path: '/files/render',
                channel: 'renderer',
                renderer
            })
    }
}
