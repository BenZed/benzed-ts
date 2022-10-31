import { createServer, Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Server as IOServer } from 'socket.io'

import Server, { $serverSettings, ServerSettings } from './server'
import { Command } from '../../../command'
import { HttpCode } from './http-codes'
import { WEBSOCKET_PATH } from '../../../constants'
import { HttpMethod } from './http-methods'

import match from '@benzed/match'
import { createNameFromReq } from '../../../command/request'

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
    private _commands: { [key: string]: Command } = {}

    constructor(settings: Required<ServerSettings>) {
        super(settings)

        this._koa = this._setupKoa()
        this._http = this._setupHttpServer(this._koa)
        this._io = this.settings.webSocket 
            ? this._setupSocketIOServer(this._http)
            : null
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

        this._commands = this.parent?.getCommands() ?? {}

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

    private _isCommandListRequest(ctx: Context): boolean {
        return this._splitUrl(ctx).length === 0 && ctx.method.toLowerCase() === `options`
    }

    private _splitUrl(ctx: Context): string[] {
        return ctx.url.split(`/`).filter(w => w.trim())
    }
    private _createCommandFromCtx(ctx: Context): [ command: Command, data: object ] {

        const [ ctxData ] = match(ctx.method)
        (HttpMethod.Get, ctx.query)
        (HttpMethod.Post, ctx.body ?? {})
        (HttpMethod.Put, ctx.body ?? {})
        (HttpMethod.Patch, ctx.body ?? {})
        ({})

        if (this._commands) {
            for (const name in this._commands) {
            
                const command = this._commands?.[name]

                const fromReq = command.fromReq ?? createNameFromReq(name)

                const commandData = fromReq([ ctx.method as HttpMethod, ctx.url, ctxData ])
                if (commandData)
                    return [ command, commandData ]
            }
        }

        return ctx.throw(HttpCode.InternalServerError, `${Server.name} cannot create command from context ${ctx.method} ${ctx.url}`)
    }

    // Initialization

    private _setupKoa(): Koa {

        const koa = new Koa()

        // Standard Middleware
        koa.use(cors())
        koa.use(body())

        // Route Everything to command handlers
        koa.use(async (ctx) => {

            let output
            if (this._isCommandListRequest(ctx))
                output = await this.getCommandList()
            else { 
                const [command, input] = this._createCommandFromCtx(ctx)

                this.log`rest command: ${command}`
                output = await command(input)
            }

            ctx.body = output
        })

        return koa
    }

    private _setupHttpServer(koa: Koa): HttpServer {
        return createServer(koa.callback())
    }

    private _setupSocketIOServer(http: HttpServer): IOServer {

        const io = new IOServer(http, { path: WEBSOCKET_PATH })

        io.on(`connection`, socket => {

            this.log`${socket.id} connected`

            socket.on(`command`, async (name: string, input: object, reply) => {

                this.log`${socket.id} command: ${name} ${input}`

                try {

                    const command = Object
                        .entries(this._commands)
                        .find(entry => entry[0] === name)?.[1] ?? null

                    if (!command)
                        throw new Error(`Could not find command ${name}`)

                    const output = await command(input)

                    this.log`${socket.id} reply: ${output}`
                    reply(null, output)
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