import type { FileServerApp } from '../create-file-server-app'

import authentication from './authentication'
import { AuthenticationService } from '@feathersjs/authentication'

import files from './files'
import users, { UserService } from './users'
import render from './render'

export interface FileServices {
    authentication: AuthenticationService
    users: UserService
    // files: FileService
}

/*** Main ***/

export default function setupFileServices(app: FileServerApp): void {

    app.configure(authentication)
    app.configure(users)
    app.configure(files)
    app.configure(render)

}