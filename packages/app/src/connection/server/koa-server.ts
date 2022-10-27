import { Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import cors from '@koa/cors'

import Server, { ServerSettings } from './server'
import type { Command } from '../../command'

/*** Command ***/

const $$served = Symbol(`request-came-from-http-or-websocket-server`)

interface ToServerCommand extends Command {

    [$$served]: true

}

/*** KoaServer ***/

/**
 * Server implementation using KOA/socket.io
 */
export class KoaServer extends Server<ToServerCommand> {

    private readonly _koa 
    private _http: HttpServer | null = null

    /**
     * Servers emit commands, so they should only be able to execute commands 
     * that have been built from a http or websocket request.
     */
    override canExecute(command: Command): command is ToServerCommand {
        return $$served in command
    }

    override _execute(command: Command): object | Promise<object> {
        if (!this.parent)
            throw new Error(`Server ${command}`)

        return this.parent.execute(command)
    }

    constructor(settings: ServerSettings) {
        super(settings)

        this._koa = new Koa()
        this._koa.use(cors())
        this._koa.use(async (ctx) => {
            const cmd = this._commandFromCtx(ctx)
            ctx.body = await this.execute(cmd)
        })
    }

    private _splitUrl(ctx: Context): string[] {
        return ctx.url.split(`/`).filter(w => w.trim())
    }

    private _commandFromCtx(ctx: Context): Command {

        const name = this._splitUrl(ctx).join(`-`)
        const action = null
        if (!name || !action)
            throw new Error(`Could not resolve command from context.`)

        return { 
            name: `${action}-${name}` 
        }
    }

    async start(): Promise<void> {

        await super.start()
        const { _koa: koa } = this

        const { port } = this.settings

        await new Promise<void>((resolve, reject) => {
            this._http = koa.listen(port, resolve)
            this._http.once(`error`, reject)
        })
    }

    async stop(): Promise<void> {
        await super.stop()

        const http = this._http as HttpServer
        
        await new Promise<void>((resolve, reject) => {
            http.close(err => err ? reject(err) : resolve())
        })
    }
}