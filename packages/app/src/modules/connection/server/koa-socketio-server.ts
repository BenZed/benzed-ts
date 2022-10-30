import { createServer, Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Server as IOServer } from 'socket.io'

import Server, { $serverSettings, ServerSettings } from './server'
import { Command } from '../../../command'
import { HttpCode } from './http-codes'
import { WEBSOCKET_PATH } from '../../../constants'

/*** KoaServer ***/

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
        this._io = this._setupSocketIOServer(this._http)
    }

    // Connection Implementation

    override getCommandList(): Promise<Command['name'][]> {
        return Promise.resolve([])
    }
    
    override async start(): Promise<void> {
    
        await super.start()
    
        const { port } = this.settings
    
        await new Promise<void>((resolve, reject) => {
            this._http.listen(port, resolve)
            this._http.once(`error`, reject)
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

    // Helper

    private _relayCommand(command: Command): Promise<object> {
        
        if (!this.parent) {
            throw new Error(
                `${Server.name} cannot relay any commands.`
            )
        }

        throw new Error(
            `not yet implementedp`
        )
    }

    // Koa Helpers

    private _isCommandListRequest(ctx: Context): boolean {
        return this._splitUrl(ctx).length === 0 && ctx.method.toLowerCase() === `options`
    }

    private _splitUrl(ctx: Context): string[] {
        return ctx.url.split(`/`).filter(w => w.trim())
    }
    private _createCommandFromCtx(ctx: Context): Command {

        // for now, all commands can be posted to the root with the command json as a body
        if (ctx.method === `POST` && ctx.url === `/`)
            return JSON.parse(ctx.request.body)

        return ctx.throw(HttpCode.InternalServerError, `${Server.name} cann`)
    }

    // Initialization

    private _setupKoa(): Koa {

        const koa = new Koa()

        // Standard Middleware
        koa.use(cors())
        koa.use(body())

        // Route Everything to command handlers
        koa.use(async (ctx) => {

            let response
            if (this._isCommandListRequest(ctx))
                response = await this.getCommandList()
            else { 
                const command = this._createCommandFromCtx(ctx)

                this.log`rest command: ${command}`
                response = await this._relayCommand(command)
            }

            ctx.body = response
        })

        return koa
    }

    private _setupHttpServer(koa: Koa): HttpServer {
        return createServer(koa.callback())
    }

    private _setupSocketIOServer(http: HttpServer): IOServer | null {
        if (!this.settings.webSocket)
            return null

        const io = new IOServer(http, { path: WEBSOCKET_PATH })

        io.on(`connection`, socket => {

            this.log`${socket.id} connected`

            socket.on(`command`, async (cmd: Command, reply) => {

                this.log`${socket.id} command: ${cmd}`

                try {
                    const result = await this._relayCommand(cmd)

                    this.log`${socket.id} reply: ${cmd}`
                    reply(null, result)
                } catch (e) {

                    this.log.error`${socket.id} command error: ${e}`
                    reply(e)
                }
            })

            socket.once(`disconnected`, () => {
                this.log`${socket.id} disconnected`
            })
        })

        return io
    }
}