import match from '@benzed/match'

import { createServer, Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Server as IOServer } from 'socket.io'

import Server, { $serverSettings, ServerSettings } from './server'
import { WEBSOCKET_PATH } from '../../../constants'

import { HttpCode } from './http-codes'
import { HttpMethod } from './http-methods'

//// KoaServer ////

/**
 * Server implementation using KOA/socket.io
 */
export class KoaSocketIOServer extends Server {

    static create(settings: ServerSettings = {}): KoaSocketIOServer {

        return new KoaSocketIOServer(
            $serverSettings.validate(settings) as Required<ServerSettings>
        )
    }

    private readonly _http: HttpServer
    private readonly _koa: Koa
    private readonly _io: IOServer | null

    constructor(settings: Required<ServerSettings>) {
        super(settings)

        this._koa = this._setupKoa()
        this._http = this._setupHttpServer(this._koa)
        this._io = this.settings.webSocket 
            ? this._setupSocketIOServer(this._http)
            : null
    }

    // Connection Implementation

    execute(name: string, data: object): Promise<object> {
        return Promise.resolve(
            this.root.getCommand(name).execute(data)
        )
    }

    // Module Implementation

    override async start(): Promise<void> {
    
        await super.start()
    
        const { port } = this.settings
    
        await new Promise<void>((resolve, reject) => {
            this._http.listen(port, resolve)
            this._http.once('error', reject)
        })

        this.log`listening for connections ${{ port }}`
    }
    
    override async stop(): Promise<void> {
        await super.stop()
    
        const http = this._http as HttpServer

        if (this._io)
            this._io.sockets.sockets.forEach(socket => socket.disconnect(true))
            
        await new Promise<void>((resolve, reject) => {
            http.close(err => err ? reject(err) : resolve())
        })

        this.log`shutdown`
    }

    // Koa Helpers

    private _getCtxCommandData(ctx: Context): object {
        const [ ctxData ] = match(ctx.method)
        (HttpMethod.Get, ctx.query)
        (HttpMethod.Post, ctx.body ?? {})
        (HttpMethod.Put, ctx.body ?? {})
        (HttpMethod.Patch, ctx.body ?? {})
        ({})

        return ctxData
    }

    private _executeCtxCommand(ctx: Context): Promise<object> {

        const ctxData = this._getCtxCommandData(ctx)

        for (const name in this.root.commands) {
            const cmdData = this.root.getCommand(name).fromRequest(ctx.method as HttpMethod, ctx.url, ctxData)
            if (cmdData)
                return this.execute(name, cmdData)
        }

        return ctx.throw(
            HttpCode.NotFound, 
            `Not found: ${ctx.method} ${ctx.url}`
        )
    }

    // Initialization

    private _setupKoa(): Koa {

        const koa = new Koa()

        // Standard Middleware
        koa.use(cors())
        koa.use(body())

        // Route Everything to command handlers
        koa.use(async (ctx, next) => {
            await next()
            ctx.body = await this._executeCtxCommand(ctx)
        })

        return koa
    }

    private _setupHttpServer(koa: Koa): HttpServer {
        return createServer(koa.callback())
    }

    private _setupSocketIOServer(http: HttpServer): IOServer {

        const io = new IOServer(http, { path: WEBSOCKET_PATH })

        io.on('connection', socket => {

            this.log`${socket.id} connected`

            // Handle commands from socket
            socket.on('command', async (name: string, input: object, reply) => {

                this.log`${socket.id} command: ${name} ${input}`

                try {

                    const output = await this.execute(name, input)

                    this.log`${socket.id} reply: ${output}`
                    reply(null, output)
                } catch (e) {

                    this.log`${socket.id} command error: ${e}`
                    reply(e)
                }
            })

            // 
            socket.once('disconnected', () => {
                this.log`${socket.id} disconnected`
            })
        })

        return io
    }
}