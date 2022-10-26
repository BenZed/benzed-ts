import { EventEmitter } from '@benzed/util'

import socketio from '@feathersjs/socketio'

import type { Server as SocketIOServer } from 'socket.io'
import type { Server as HttpServer } from 'http'

import { App, AppEmit, HookContext, Service } from '../../types'
import { LifeCycleMethod } from '../types'

import { FeathersComponents } from '../component'
import { RealtimeComponent } from './provider'
import Auth from './auth'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-explicit-any
*/

/*** Types ***/

interface RealTimeConnection {
    [key: string]: any
}

declare class Channel extends EventEmitter {
    connections: RealTimeConnection[]
    data: any
    constructor(connections?: RealTimeConnection[], data?: any)
    get length(): number
    leave(...connections: RealTimeConnection[]): this
    join(...connections: RealTimeConnection[]): this
    filter(fn: (connection: RealTimeConnection) => boolean): Channel
    send(data: any): Channel
}

type Publisher<T = any, A extends App = App, S extends Service = any> =
     (data: T, context: HookContext<A, S>) => 
     Channel | Channel[] | void | 
     Promise<Channel | Channel[] | void>

/**
  * Addons that are added behind the scenes via the _onCreate method
  */
interface SocketIOExtends {

    io: SocketIOServer

    server?: HttpServer
    listen(options: object): Promise<HttpServer>

    channels: string[]
    channel(...names: string[]): Channel

    publish<T>(publisher: Publisher<T>): this
    publish<T>(event: string, publisher: Publisher<T>): this

    registerPublisher<T>(publisher: Publisher<T>): this
    registerPublisher<T>(event: string, publisher: Publisher<T>): this
}

type ChannelSetup = (app: App & AppEmit & SocketIOExtends) => void | Publisher

/*** Helper ***/

function socketIODefaultChannels(this: SocketIO, app: App & AppEmit & SocketIOExtends): Publisher {

    app.on(`connection`, connection => {
        app.channel(`anonymous`).join(connection)
    })

    const hasAuth = this.hasComponent(Auth as any)
    if (hasAuth) {
        app.on(`login`, (_auth, { connection }) => {

            if (!connection)
                return 

            app.channel(`anonymous`).leave(connection)
            app.channel(`authenticated`).join(connection)
        })
    }  

    return () => app.channel(hasAuth ? `authenticated` : `anonymous`)
}

/*** Main ***/

/**
 * SocketIO Provider
 */
class SocketIO extends RealtimeComponent<SocketIOExtends> {

    protected _onValidateComponents(): void {
        this._assertSingle()
        this._assertConflicting(RealtimeComponent)
    }

    constructor(
        components: FeathersComponents,
        private readonly _channels: ChannelSetup = socketIODefaultChannels
    ) {
        super(components)
    }

    protected _onConfig = ((app: App & AppEmit & SocketIOExtends) => {
        app.configure(socketio() as any)

        const result = this._channels(app)
        if (result)
            app.publish(result)

    }) as LifeCycleMethod<any>

    protected _createBuildExtends(): SocketIOExtends {
        return {} as SocketIOExtends
    }

}

/*** Exports ***/

export default SocketIO

export {
    SocketIO
}