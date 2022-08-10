
import { AuthenticationResult } from '@feathersjs/authentication'

import { MongoApplication, MongoApplicationConfig } from './create-mongo-application'
import { HookContext } from '../types'

import is from '@benzed/is'

/*** Main ***/

export default function setupChannels<S, C extends MongoApplicationConfig>(
    app: MongoApplication<S, C>
): void {

    const hasRealTimeTransport = is.function(app.channel)
    if (!hasRealTimeTransport)
        return

    app.on('connection', (connection): void => {
        app.channel('anonymous').join(connection)
    })

    app.on('login', (
        _authResult: AuthenticationResult,
        { connection }: HookContext<MongoApplication<S, C>>
    ): void => {
        if (connection) {
            app.channel('anonymous').leave(connection)
            app.channel('authenticated').join(connection)
        }
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.publish((_data: unknown, _hook: HookContext<MongoApplication<S, C>>) => {
        return app.channel('authenticated')
    })
}

export {
    setupChannels
}