
import { is, IsType } from '@benzed/is'
import { each, nil, pick } from '@benzed/util'

import { createServer, Server as HttpServer } from 'http'
import Koa from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Module } from '../../module'
import { Connection } from '../connection'
import { HttpMethod, isPort } from '../../util'

//// Types ////

interface ServerSettings {

    /**
     * Port to open
     */
    readonly port: number

}

const isServerSettings: IsType<ServerSettings> = is.shape({

    port: isPort.readonly

})

//// Main ////

/**
 * This server module provides functionality for:
 * - Accepting client connections
 * - Routing client commands
 */
class Server extends Connection implements ServerSettings {

    constructor(
        settings: Partial<ServerSettings> = {}
    ) {
        super()
        this.port = isServerSettings
            .validate(settings)
            .port
    }

    //// State ////

    readonly port: number

    get [Module.state](): ServerSettings {
        return pick(this, 'port')
    }

    //// Trait Implementations ////

    protected async _onStart(): Promise<void> {
        const http = this._http ?? this._setupHttpServer()

        await new Promise<void>((resolve, reject) => {
            http.listen(this.port, resolve)
            http.once('error', reject)
        })

    }

    protected async _onStop(): Promise<void> {
        const http = this._http
        if (http) {
            await new Promise<void>((resolve, reject) => {
                http.close(err => err ? reject(err) : resolve())
            })
        }
    }

    //// Runtime State ////

    private _http: HttpServer | nil = nil

    //// Helper ////
    
    private _setupHttpServer(): HttpServer {

        const koa = this._createKoa()
        const handleRequest = koa.callback()
        this._http = createServer(handleRequest)

        return this._http
    }

    private _createKoa(): Koa {

        const koa = new Koa()

        const allowMethods: string[] = this.parent
        // TODO get allowed methods from commands
            ? [ ...each.valueOf(HttpMethod) ]
            : each.valueOf(HttpMethod).toArray()

        // Cors Middleware
        koa.use(cors({ allowMethods }))

        // BodyParser Middleware
        koa.use(body())

        // Route Everything to command handlers
        koa.use(async (ctx, next) => {

            await next()
            const result = { code: 200 } // TODO get result from command

            if (is.number(result.code))
                ctx.status = result.code 

            ctx.body = result
        })

        return koa
    }
}

//// Exports ////

export default Server

export {
    Server,
    ServerSettings,
    isServerSettings
}