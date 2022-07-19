import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { expressOauth } from '@feathersjs/authentication-oauth'

import type { FileServerApp } from '../create-file-server-app'

/*** Type Extensions ***/

declare module '../create-file-server-app' {

    interface FileServices {
        'authentication': AuthenticationService
    }

}

/*** Main ***/

export default function (app: FileServerApp): void {
    const authentication = new AuthenticationService(app)

    authentication.register('jwt', new JWTStrategy())
    authentication.register('local', new LocalStrategy())

    app.use('authentication', authentication)
    app.configure(expressOauth())
}