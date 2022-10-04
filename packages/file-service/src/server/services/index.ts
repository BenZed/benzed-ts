import type { FileServerApp } from '../create-file-server-app'

import authentication from './authentication'
import { AuthenticationService } from '@feathersjs/authentication'

import files, { FileService } from './files'
import users, { UserService } from './users'
import render, { RenderService } from './render'

export interface FileServices {

    'authentication'?: AuthenticationService
    'users'?: UserService

    'files/render'?: RenderService
    'files': FileService

}

/*** Main ***/

export default function setupFileServices(app: FileServerApp): void {

    app.configure(authentication)
    app.configure(users)
    app.configure(files)
    app.configure(render)

}