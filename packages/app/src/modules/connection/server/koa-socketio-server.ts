import is from '@benzed/is'
import { keysOf, nil, isNumber } from '@benzed/util'
import { unique } from '@benzed/array'

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

    private _http: HttpServer | nil = nil
    private _io: IOServer | nil = nil

    // Module Implementation

    override async start(): Promise<void> {
    
        await super.start()

        const http = this._http ?? this._setupHttpServer()
        if (!this._io && this.settings.webSocket)
            this._setupSocketIOServer(http)
        
        const { port } = this.settings
    
        await new Promise<void>((resolve, reject) => {
            http.listen(port, resolve)
            http.once('error', reject)
        })

        this.log`listening for connections ${{ port }}`
    }
    
    override async stop(): Promise<void> {
        await super.stop()
   
        const io = this._io
        if (io) {
            io.sockets
                .sockets
                .forEach(socket => socket.disconnect())
        }

        const http = this._http
        if (http) {
            await new Promise<void>((resolve, reject) => {
                http.close(err => err ? reject(err) : resolve())
            })
        }

        this.log`shutdown`
    }

    // Koa Helpers

    private async _executeCtxCommand(ctx: Context): Promise<object> {

        const { url, ...req } = ctxToRequest(ctx)

        let matchMethod = false
        for (const commandName of keysOf(this.root.commands)) {
            const command = this._getCommand(commandName)
            if (!command)
                continue

            if (command.request.method === req.method)
                matchMethod = true
    
            const input = command
                .request
                .match({
                    ...req,
                    url: url.replace(command.pathFromRoot, '') as Path
                })

            if (input) {
                const result = await command.execute(input)
                return result
            }
        }

        if (!matchMethod) {
            throw new CommandError(
                HttpCode.MethodNotAllowed,
                `Method ${ctx.method} is not allowed`
            )
        } else {
            throw new CommandError(
                HttpCode.NotFound, 
                `Could not ${ctx.method} ${ctx.url}`, 
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

    private _createKoa(): Koa {

        const koa = new Koa()

        const allowMethods: string[] = this.parent 
            ? Object.values(this.root.commands).map(c => c.request.method).filter(unique)
            : Object.values(HttpMethod)

        // Standard Middleware
        koa.use(cors({ allowMethods }))
        koa.use(body())

        // Route Everything to command handlers
        koa.use(async (ctx, next) => {
            await next()
            const result = await this
                ._executeCtxCommand(ctx)
                .catch(CommandError.from) as { code?: number }
            
            if (isNumber(result.code))
                ctx.status = result.code 
            
            ctx.body = result
        })

        return koa
    }

    private _setupHttpServer(): HttpServer {

        const koa = this._createKoa()

        this._http = createServer(koa.callback())
        return this._http
    }

    private _setupSocketIOServer(http: HttpServer): IOServer {

        this._io = new IOServer(http, { path: WEBSOCKET_PATH })

        this._io.on('connection', socket => {

            this.log`${socket.id} connected`

            // Handle commands from socket
            socket.on('command', async (name: string, input: object, reply) => {

                this.log`${socket.id} command: ${name} ${input}`

                const command = this._getCommand(name)
                try {
                    if (!command) {
                        throw new CommandError(
                            HttpCode.NotFound, 
                            `Could not find command '${name}'`
                        )
                    }

                    const output = await command.execute(input)

                    this.log`${socket.id} reply: ${output}`
                    reply(null, output)
                } catch (e) {
                    this.log`${socket.id} command error: ${e}`
                    reply(CommandError.from(e))
                }
            })

            // 
            socket.once('disconnected', () => {
                this.log`${socket.id} disconnected`
            })
        })

        return this._io

    }
}