import type { FileServerApp, FileServerHookContext } from './create-file-server-app'

import { AuthenticationResult } from '@feathersjs/authentication'

/*** Main ***/

export default function (app: FileServerApp): void {

    const hasRealTimeTransport = typeof app.channel === 'function'
    if (!hasRealTimeTransport)
        return

    app.on('connection', (connection): void => {
        // On a new real-time connection, add it to the anonymous channel
        app.channel('anonymous').join(connection)
    })

    app.on('login', (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        authResult: AuthenticationResult,
        { connection }: FileServerHookContext
    ): void => {
        if (!connection)
            return

        app.channel('anonymous').leave(connection)
        app.channel('authenticated').join(connection)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.publish((data: unknown, hook: FileServerHookContext) => {
        return app.channel('authenticated')
    })

}
