import type { FileServerApp } from '../create-file-server-app'

import authentication from './authentication'

/*** Main ***/

export default function configureFileServices(app: FileServerApp): void {

    app.configure(authentication)

}