
import { is, IsType } from '@benzed/is'
import { each, nil, pick } from '@benzed/util'

import { createServer, Server as HttpServer } from 'http'
import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Connection } from '../connection'
import { Command, CommandError } from '../command'

import { Module } from '../../module'
import { HttpCode, HttpMethod, isPort } from '../../util'
import { equals } from '@benzed/immutable'

//// EsLint ////
/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

interface ServerSettings {

    /**
     * Port to open
     */
    readonly port: number

}

const isServerSettings: IsType<ServerSettings> = is.readonly({

    port: isPort

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
        koa.use(
            cors({ 
                allowMethods 
            })
        )

        // BodyParser Middleware
        koa.use(body())

        koa.use(async (ctx, next) => {
            await next()
            const result = await this
                ._executeCtxCommand(ctx)
                .catch(CommandError.from) as { code?: number }

            if (is.shape({ code: is.number })(result))
                ctx.status = result.code 

            ctx.body = result
        })

        return koa
    }

    private async _executeCtxCommand(ctx: Context): Promise<unknown> {

        const command = this._getCtxCommand(ctx)
        if (!command) {
            throw new CommandError(
                HttpCode.NotFound,
                `Could not ${ctx.method} ${ctx.url}`, 
                { 
                    method: ctx.method,
                    url: ctx.url
                }
            )
        }

        const input = ctx.request.body && is.string(ctx.request.body) 
            ? JSON.parse(ctx.request.body)
            : ctx.request.body

        const output = await command.execute(input)

        return is.string(output) ? output : JSON.stringify(output)
    }

    private _getCtxCommand(ctx: Context): Command | nil {

        const endSlashes = /^(\/+)|(\/+)$/

        const method = ctx.method.toUpperCase()

        const path = ctx.originalUrl
            .replace(endSlashes, '')
            .split('/') // 'path/to' -> ['path', 'to']

        const commands = this.find.all.inNodes(is(Command))
        
        const ctxCommand = commands.find(c => c.method === method && equals(c.path, path))
        return ctxCommand
    }
}

//// Exports ////

export default Server

export {
    Server,
    ServerSettings,
    isServerSettings
}