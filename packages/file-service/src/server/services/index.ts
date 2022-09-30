import type { FileServerApp } from '../create-file-server-app'

import authentication from './authentication'
import files from './files'
import render from './render'

/*** Main ***/

export default function setupFileServices(app: FileServerApp): void {

    app.configure(authentication)
    app.configure(files)
    app.configure(render)

}