import { Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import body from 'koa-body'
import cors from '@koa/cors'

import Server, { ServerSettings } from './server'
import { Command } from '../../command'
import { HttpStatus } from './http-codes'

/*** KoaServer ***/

/**
 * Server implementation using KOA/socket.io
 */
export class KoaServer extends Server {

    private readonly _koa 
    private _http: HttpServer | null = null

    constructor(settings: ServerSettings) {
        super(settings)

        this._koa = new Koa()
        this._koa.use(cors())
        this._koa.use(body())
        this._koa.use(async (ctx) => {

            let response
            if (this._isCommandListRequest(ctx))
                response = await this.getCommandList()
            else { 
                const command = this._createCommandFromCtx(ctx)
                response = await this._relayCommand(ctx, command)
            }

            ctx.body = response
        })
    }

    // Connection Implementation

    override getCommandList(): Promise<Command['name'][]> {
        return Promise.resolve([])
    }
    
    override async start(): Promise<void> {
    
        await super.start()
        const { _koa: koa } = this
    
        const { port } = this.settings
    
        await new Promise<void>((resolve, reject) => {
            this._http = koa.listen(port, resolve)
            this._http.once(`error`, reject)
        })
    }
    
    override async stop(): Promise<void> {
        await super.stop()
    
        const http = this._http as HttpServer
            
        await new Promise<void>((resolve, reject) => {
            http.close(err => err ? reject(err) : resolve())
        })
    }

    // Helper

    private _isCommandListRequest(ctx: Context): boolean {
        return this._splitUrl(ctx).length === 0 && ctx.method.toLowerCase() === `options`
    }

    private _splitUrl(ctx: Context): string[] {
        return ctx.url.split(`/`).filter(w => w.trim())
    }

    private _relayCommand(ctx: Context, command: Command): Promise<object> {
        
        if (!this.parent) {
            return ctx.throw(
                HttpStatus.InternalServerError, 
                `${Server.name} cannot relay any commands.`
            )
        }

        try {
            return this.parent.execute(command)
        } catch (e) {
            ctx.throw(HttpStatus.BadRequest, (e as Error).message)
        }
    }

    private _createCommandFromCtx(ctx: Context): Command {

        // for now, all commands can be posted to the root with the command json as a body
        if (ctx.method === `POST` && ctx.url === `/`)
            return JSON.parse(ctx.request.body)

        return ctx.throw(HttpStatus.InternalServerError, `${Server.name} cann`)
    }
}