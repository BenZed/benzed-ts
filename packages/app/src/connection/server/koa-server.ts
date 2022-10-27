import { Server as HttpServer } from 'http'

import Koa, { Context } from 'koa'
import cors from '@koa/cors'

import Server, { ServerSettings } from './server'
import type { Command } from '../../command'

/*** KoaServer ***/

/**
 * Koa is a means to an end. I'd like to keep the implementation as
 * de-coupled from the rest of the app logic as possible. The only 
 * thing interacting with the KOA Api should be this class.
 * 
 * I mean, Koa is great, I don't think I'll ever build my own 
 * http server request/response parser, but still.
 */
export class KoaServer extends Server {

    private readonly _koa 
    private _http: HttpServer | null = null

    constructor(settings: ServerSettings) {
        super(settings)

        this._koa = new Koa()
        this._koa.use(cors())
        this._koa.use(async (ctx, next) => {
            await next()
            ctx.body = this._isInfoRequest(ctx) || !this.parent
                ? { version: `0.0.1`, name: `benzed-ecs-app` }
                : await this.parent.execute(this._commandFromCtx(ctx))
        })
    }

    private _isInfoRequest(ctx: Context): boolean {
        return ctx.method.toLowerCase() === `options` && this._splitUrl(ctx).length === 0
    }

    private _splitUrl(ctx: Context): string[] {
        return ctx.url.split(`/`).filter(w => w.trim())
    }

    private _commandFromCtx(ctx: Context): Command {

        const name = this._splitUrl(ctx).join(`-`)
        const action = null
        if (!name || !action)
            throw new Error(``)

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