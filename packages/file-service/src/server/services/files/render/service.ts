import {
    $rendererConfig,
    Renderer,
    RendererConfig
} from '@benzed/renderer'

import $, {
    Asserts, 
    Infer, 
    ValidationError 
} from '@benzed/schema'

import {
    MongoDBApplication,
    validationErrorToBadRequest
} from '@benzed/feathers'

import { Params } from '@feathersjs/feathers'
import { BadRequest, NotFound, MethodNotAllowed } from '@feathersjs/errors'
import { RealTimeConnection } from '@feathersjs/transport-commons'

import { FeathersFileService } from '../middleware/util'
import { File } from '../schema'

import { Server, Socket } from 'socket.io'
import ClientRendererAgent from './client-renderer-agent'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Constants ***/

const SERVER_RENDERER_ID = 'local'

/*** Types ***/

interface RenderServiceConfig extends RendererConfig {
    app: MongoDBApplication
    files: FeathersFileService
}

export interface RendererRecord extends RendererRecordData {
    _id: string
    current: { file: string, setting: string }[]
    queued: { file: string, setting: string }[]
}

/*** Schema ***/

interface RendererRecordData extends Infer<typeof rendererRecordData> {}
const rendererRecordData = $({
    maxConcurrent: $rendererConfig.$.maxConcurrent.clearFlags()
})

const { is: isClientRenderAgent } = $(ClientRendererAgent)

const assertCreateData: Asserts<typeof rendererRecordData> = rendererRecordData.assert

/*** Main ***/

class RenderService {

    private readonly _renderers: (Renderer | ClientRendererAgent)[]
    private readonly _files: FeathersFileService
    private readonly _app: MongoDBApplication

    public readonly settings: RendererConfig['settings']

    public constructor (config: RenderServiceConfig) {
        const {
            app,
            files,
            maxConcurrent = 0,
            settings,
        } = config

        this.settings = settings

        this._app = app
        this._files = files

        this._renderers = maxConcurrent > 0
            ? [
                new Renderer({
                    maxConcurrent,
                    settings
                })
            ]
            : []

        this._applyFileHandlers()
    }

    // eslint-disable-next-line
    public async create(data: { maxConcurrent: number }, params?: Params): Promise<RendererRecord> {

        try {
            assertCreateData(data)
        } catch (e) {
            throw validationErrorToBadRequest(e as ValidationError)
        }
        
        const [socket, connection] = this._getSocketConnection(params)
        if (!socket)
            throw new MethodNotAllowed('only socket.io clients may create a renderer')

        const existing = this._getRenderer(socket.id)
        if (existing)
            throw new BadRequest('renderer already created for this connection')

        const { settings } = this

        this._renderers.push(
            new ClientRendererAgent({
                ...data,
                socket,
                settings
            })
        )

        this._app.channel('renderers').join(connection)

        socket.once('disconnect', () => {
            if (this._getRenderer(socket.id)) 
                this.remove(socket.id)
            
        })

        // TODO rebalance queue

        return this.get(socket.id)
    }

    public async get (id: RendererRecord['_id']): Promise<RendererRecord> {

        const renderer = await this._assertGetRenderer(id)
        
        return this._toRenderRecord(renderer)
    }

    public find(): Promise<RendererRecord[]> {
        return Promise.all(
            this._renderers.map(this._toRenderRecord)
        )
    }

    public async remove(id: RendererRecord['_id'], params?: Params): Promise<RendererRecord> {

        if (params?.provider)
            throw new MethodNotAllowed('renderers cannot be removed')

        if (id === SERVER_RENDERER_ID)
            throw new BadRequest('server renderer cannot be removed')

        const renderer = await this._assertGetRenderer(id)
        const index = this._renderers.indexOf(renderer)

        this._renderers.splice(index, 1)

        if (isClientRenderAgent(renderer) && renderer.socket.connected)
            renderer.socket.disconnect()

        // TODO rebalance queue

        return this._toRenderRecord(renderer)
    }

    // Helper

    private readonly _toRenderRecord = (
        renderer: Renderer | ClientRendererAgent
    ): RendererRecord =>{

        const _id = isClientRenderAgent(renderer) ? renderer.socket.id : SERVER_RENDERER_ID
        const maxConcurrent = renderer.config.maxConcurrent
        const current: RendererRecord['current'] = []
        const queued: RendererRecord['queued'] = []

        return {
            _id,
            maxConcurrent,
            current,
            queued
        }
    }

    private _applyFileHandlers(): void {

        this._files.on('patch', (file: File) => {
            // TODO
            // - if renderable file
            // - if renders not already queued
            // - if renders not already made
            // - send to queue
        })

        this._files.on('remove', (file: File) => {
            // TODO
            // - if renders queued
            // - remove from queue
        })

    }
    
    private _getSocketConnection(params?: Params): [Socket, RealTimeConnection] | [null, null] {

        if (!params?.connection || params?.provider !== 'socketio')
            return [null, null]

        const { io } = this._app as unknown as { io: Server }

        for (const socket of io.sockets.sockets.values()) {
            if ((socket as any).feathers === params.connection)
                return [socket, params.connection]
        }

        return [null, null]

    }

    private _getRenderer(id: string | null): Renderer | ClientRendererAgent | null {

        for (const renderer of this._renderers) {
            if (
                isClientRenderAgent(renderer) 
                    ? renderer.socket.id === id 
                    : id === SERVER_RENDERER_ID
            )
                return renderer
        }

        return null
    }

    private _assertGetRenderer (
        id: RendererRecord['_id']
    ): Promise<Renderer | ClientRendererAgent> {

        const renderer = this._getRenderer(id)
        if (!renderer) {
            return Promise.reject(
                new NotFound(
                    id === SERVER_RENDERER_ID 
                        ? 'server renderer not found'
                        : `renderer could not be found for id '${id}'`
                )
            )
        }
        
        return Promise.resolve(renderer)
    }

}

/*** Exports ***/

export default RenderService

export {
    RenderService,
    RenderServiceConfig
}