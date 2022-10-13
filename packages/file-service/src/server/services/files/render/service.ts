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

    /**
     * Channel that renderer clients are placed in to receive
     * render service related events
     */
    channel: string
}

export interface RendererRecord extends RendererRecordCreateData, RendererRecordPatchData {
    _id: string
}

/*** Schema ***/

type RenderItemState = Pick<RenderItem, 'id' | 'stage' | 'setting'>

interface RendererRecordPatchData {
    items: RenderItemState[]
}

interface RendererRecordCreateData extends Infer<typeof rendererRecordClientData> {}
const rendererRecordClientData = $({
    maxConcurrent: $rendererConfig.$.maxConcurrent.clearFlags()
})

const { is: isClientRenderAgent } = $.instanceOf(ClientRendererAgent)

const assertCreateData: Asserts<typeof rendererRecordClientData> = rendererRecordClientData.assert

/*** Main ***/

class RenderService {

    private readonly _renderers: Map<string, Renderer | ClientRendererAgent>
    private readonly _files: FeathersFileService
    private readonly _app: MongoDBApplication

    private readonly _channel: string

    public readonly settings: RendererConfig['settings']

    public constructor (config: RenderServiceConfig) {
        const {
            app,
            files,
            channel,
            maxConcurrent = 0,
            settings,
        } = config

        this.settings = settings

        this._app = app
        this._channel = channel
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
    public async create(data: RendererRecordCreateData, params?: Params): Promise<RendererRecord> {

        try {
            assertCreateData(data)
        } catch (e) {
            throw validationErrorToBadRequest(e as ValidationError)
        }
        
        const [socket, connection] = this._getConnectionSocket(params)
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

        this._app.channel(this._channel).join(connection)

        socket.once('disconnect', () => {
            if (this._getRenderer(socket.id)) 
                this.remove(socket.id)
        })

        this._rebalanceQueue()

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

    public async patch(
        id: RendererRecord['_id'], 
        data: Partial<RendererRecordPatchData>, 
        params?: Params
    ): Promise<RendererRecord> {

        if (params?.provider)
            throw new MethodNotAllowed('renderers cannot be patched')

        const renderer = await this._assertGetRenderer(id)

        return this._toRenderRecord(renderer)
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
        const items = renderer.items().map(({ stage, id, setting }) => ({
            stage,
            id,
            setting
        }))

        return {
            _id,
            maxConcurrent,
            items
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