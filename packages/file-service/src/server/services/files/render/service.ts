import { Server, Socket } from 'socket.io'

import {

    Renderer,

    $rendererConfig,
    RendererConfig,
    RenderItem

} from '@benzed/renderer'

import {
    $,
    Infer, 
    Asserts, 
    ValidationError 
} from '@benzed/schema'

import {
    MongoDBApplication,
    validationErrorToBadRequest
} from '@benzed/feathers'

import { Params } from '@feathersjs/feathers'

import {
    NotFound, 
    BadRequest, 
    MethodNotAllowed
} from '@feathersjs/errors'

import { RealTimeConnection } from '@feathersjs/transport-commons'

import { File } from '../schema'

import { FeathersFileService } from '../middleware/util'
import { ClientRendererAgent } from './client-renderer-agent'

import { SERVER_RENDERER_ID } from '../constants'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

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

const { is: isClientRenderAgent } = $.instanceOf(ClientRendererAgent)

const assertCreateData: Asserts<typeof rendererRecordData> = rendererRecordData.assert

/*** Main ***/

class RenderService {

    private readonly _renderers: Map<string, Renderer | ClientRendererAgent>
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

        this._renderers = new Map() 
        if (maxConcurrent > 0) {
            this._renderers.set(
                SERVER_RENDERER_ID,
                new Renderer({
                    maxConcurrent,
                    settings
                })
            )
        }

        this._files = files
        this._files.on('patch', this._addFileToQueue)
        this._files.on('remove', this._removeFileFromQueue)
    }

    // eslint-disable-next-line
    public async create(data: { maxConcurrent: number }, params?: Params): Promise<RendererRecord> {

        try {
            assertCreateData(data)
        } catch (e) {
            throw validationErrorToBadRequest(e as ValidationError)
        }
        
        const [socket] = this._getConnectionSocket(params)
        if (!socket)
            throw new MethodNotAllowed('only socket.io clients may create a renderer')

        const existing = this._getRenderer(socket.id)
        if (existing)
            throw new BadRequest('renderer already created for this connection')

        const { settings } = this

        this._renderers.set(
            socket.id,
            new ClientRendererAgent({
                ...data,
                socket,
                settings
            })
        )

        this._rebalanceQueue()

        socket.once('disconnect', () => {
            if (this._getRenderer(socket.id)) 
                this.remove(socket.id)
            
        })

        return this.get(socket.id)
    }

    public async get (id: RendererRecord['_id']): Promise<RendererRecord> {

        const renderer = await this._assertGetRenderer(id)
        
        return this._toRenderRecord(renderer)
    }

    public find(): Promise<RendererRecord[]> {
        return Promise.all(
            Array.from(this._renderers.values(), this._toRenderRecord)
        )
    }

    public async remove(id: RendererRecord['_id'], params?: Params): Promise<RendererRecord> {

        if (params?.provider)
            throw new MethodNotAllowed('renderers cannot be removed')

        if (id === SERVER_RENDERER_ID)
            throw new BadRequest('server renderer cannot be removed')

        const renderer = await this._assertGetRenderer(id)

        if (isClientRenderAgent(renderer) && renderer.socket.connected)
            renderer.socket.disconnect()

        this._renderers.delete(id)

        this._rebalanceQueue(
            renderer.items()
        )

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

    private readonly _addFileToQueue = (file: File): void => {
        // TODO
        // - if renderable file
        // - if renders not already queued
        // - if renders not already made
        // - send to queue
    }

    private readonly _removeFileFromQueue = (file: File): void => {
        // TODO
        // - if renders queued
        // - remove from queue
    }

    private _rebalanceQueue(additionalItems: RenderItem[] = []): void {
        // Ensure each renderer has an equal load of work
    }

    private _getConnectionSocket(params?: Params): [Socket, RealTimeConnection] | [null, null] {

        if (!params?.connection || params?.provider !== 'socketio')
            return [null, null]

        const { io } = this._app as unknown as { io: Server }

        for (const socket of io.sockets.sockets.values()) {
            if ((socket as any).feathers === params.connection)
                return [socket, params.connection]
        }

        return [null, null]

    }

    private _getRenderer(id: string): Renderer | ClientRendererAgent | null {
        return this._renderers.get(id) ?? null
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