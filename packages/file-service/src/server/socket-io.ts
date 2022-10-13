import { FileServerApp } from './create-file-server-app'

import { AuthenticationResult } from '@feathersjs/authentication'
import { HookContext } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio'

/*** Main ***/

function setupSocketIO(app: FileServerApp): void {
    
    app.configure(socketio())

    // Channels

    app.on('connection', connection => {
        app.channel('anonymous').join(connection)
    })

    app.on('login', (_auth: AuthenticationResult, { connection }: HookContext) => {

        if (!connection)
            return 

        app.channel('anonymous').leave(connection)
        app.channel('authenticated').join(connection)
    })

    app.publish((_data: unknown, _ctx: HookContext) => {
        return app.channel('authenticated')
    })

}

/*** Exports ***/

export default setupSocketIO

export {
    setupSocketIO
}