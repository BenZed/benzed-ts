import is from '@benzed/is'
import { keysOf, nil, isNumber } from '@benzed/util'

import { createServer, Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import { Server as IOServer } from 'socket.io'

import Server, { $serverSettings, ServerSettings } from './server'

import { Command, CommandError } from '../../command'

import { 
    WEBSOCKET_PATH, 
    Request, 
    Headers, 
    Path, 
    HttpCode, 
    HttpMethod
} from '../../../util'

//// Helper ////

function ctxBodyToObject(ctx: Context): Record<string, unknown> {

    if (is.object<Record<string, unknown>>(ctx.request.body))   
        return ctx.request.body

    if (is.string(ctx.request.body)) 
        return JSON.parse(ctx.request.body)

    return {}
}

function ctxToRequest(ctx: Context): Request {

    const headers = new Headers()
    for (const key in ctx.headers) {
        if (ctx.headers[key])
            headers.set(key, `${ctx.headers[key]}`)
    }

    return {
        method: ctx.method as HttpMethod,
        headers: headers,
        url: ctx.originalUrl as Path,
        body: ctxBodyToObject(ctx)
    }
}

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
   
        const io = this._io
        if (io) {
            io.sockets
                .sockets
                .forEach(socket => socket.disconnect())
        }

        await new Promise<void>((resolve, reject) => {
            http.close(err => err ? reject(err) : resolve())
        })

        this.log`shutdown`
    }

    // Koa Helpers

    private async _executeCtxCommand(ctx: Context): Promise<object> {

        const { url, ...req } = ctxToRequest(ctx)

        let methodMatch = false

        for (const commandName of keysOf(this.root.commands)) {
            const command = this._getCommand(commandName)
            if (!command)
                continue
    
            const data = command
                .request
                .match({
                    ...req,
                    url: url.replace(command.pathFromRoot, '') as Path
                })

            if (data) {
                try {
                    const result = await command.execute(data) as Promise<object>
                    return await result
                } catch (e) {
                    throw CommandError.from(e, {
                        data: {
                            command: command.name,
                            data,
                            url: ctx.url
                        }
                    })
                }
            } else if (command.request.method === req.method)
                methodMatch = true
        }

        if (!methodMatch) {
            throw new CommandError(
                HttpCode.MethodNotAllowed,
                `Method ${ctx.method} is not allowed`
            )
        } else {
            throw new CommandError(
                HttpCode.NotFound, 
                `Could not ${ctx.method} location ${ctx.url}`, 
                { 
                    method: ctx.method,
                    url: ctx.url
                })
        }
    }

    private _getCommand(name: string): Command<string, object, object> | nil {
        const commands = this.root.commands
        return commands[name as keyof typeof commands]
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
            const result = await this._executeCtxCommand(ctx).catch(CommandError.from) as { code?: number }
            
            if (isNumber(result.code))
                ctx.status = result.code 
            
            ctx.body = result
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

                const command = this._getCommand(name)
                try {
                    if (!command) {
                        throw new CommandError(
                            HttpCode.NotFound, 
                            `No command with name ${name}`
                        )
                    }

                    const output = await command(input)

                    this.log`${socket.id} reply: ${output}`
                    reply(null, output)
                
                } catch (e) {

                    this.log`${socket.id} command error: ${e}`
                    reply(
                        CommandError.from(e, {
                            data: {
                                data: input,
                                command: command?.name,
                                method: command?.request.method,
                            }
                        })
                    )
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