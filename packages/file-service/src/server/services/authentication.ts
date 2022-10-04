import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'

import type { FileServerApp } from '../create-file-server-app'

/*** Main ***/

export default function setupAuthenticationService(app: FileServerApp): void {

    if (app.get('authentication')) {
        const authentication = new AuthenticationService(app)
        authentication.register('jwt', new JWTStrategy())
        authentication.register('local', new LocalStrategy())
        // authentication.register('renderer', new RendererStrategy())

        app.use('authentication', authentication)

        app.log`authentication service configured`
    }

}