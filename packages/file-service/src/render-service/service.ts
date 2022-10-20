import { Server, Socket } from 'socket.io'

import {
    Renderer,

    $rendererConfig,
    RendererConfig,
    RenderItem
} from '@benzed/renderer'

import {
    $,
    Asserts, 
    ValidationError 
} from '@benzed/schema'

import {
    validationErrorToBadRequest
} from '@benzed/feathers'

import { Params } from '@feathersjs/feathers'

import {
    NotFound, 
    BadRequest, 
    MethodNotAllowed
} from '@feathersjs/errors'

import { File } from '../files-service/schema'

import { FeathersFileService } from '../files-service/middleware/util'
import { ClientRendererAgent } from './client-renderer-agent'

import { 
    SERVER_RENDERER_ID 
} from '../files-service/constants'

import { 
    $rendererRecordCreateData,
    RendererRecordCreateData,
} from './schema'
import { reduceToVoid, toVoid } from '@benzed/util'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

type RenderItemState = Pick<RenderItem, 'id' | 'stage' | 'setting'>

interface RendererRecord extends RendererRecordCreateData {
    _id: string
    items: RenderItemState[]
}

interface RenderServiceSettings extends RendererConfig {
    io: Server | Promise<Server>
    files: FeathersFileService
}

/*** Helper ***/

const { is: isClientRenderAgent } = $.instanceOf(ClientRendererAgent)

const assertCreateData: Asserts<typeof $rendererConfig> = $rendererRecordCreateData.assert

/*** Main ***/

class RenderService {

    private readonly _renderers: Map<string, Renderer | ClientRendererAgent>
    private readonly _files: FeathersFileService
    private readonly _io: Server | Promise<Server>

    readonly settings: RendererConfig['settings']

    constructor (serviceSettings: RenderServiceSettings) {
        const {
            io,
            files,
            maxConcurrent = 0,
            settings,
        } = serviceSettings

        this.settings = settings

        this._io = io
        this._renderers = new Map() 
        if (maxConcurrent > 0) {
            this._renderers.set(
                SERVER_RENDERER_ID,
                new Renderer({
                    maxConcurrent,
                    settings: settings
                })
            )
        }

        this._files = files
        this._files.on('patched', this.ensureFileQueued)
        this._files.on('removed', this.ensureFileUnqueued)
    }

    /*** Service Interface ***/

    async create(data: RendererRecordCreateData, params?: Params): Promise<RendererConfig & RendererRecord> {

        try {
            assertCreateData(data)
        } catch (e) {
            throw validationErrorToBadRequest(e as ValidationError)
        }
        
        const socket = await this._getConnectionSocket(params)
        if (!socket)
            throw new MethodNotAllowed('only socket.io clients may create a renderer')

        const existing = this._renderers.get(socket.id)
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

        socket.once('disconnect', () => {
            if (this._renderers.has(socket.id)) 
                this.remove(socket.id)
        })

        this._rebalanceQueue()

        return {
            ...await this.get(socket.id),
            settings
        }
    }

    async get (id: RendererRecord['_id']): Promise<RendererRecord> {

        const renderer = await this._assertGetRenderer(id)
        return this._toRenderRecord(renderer)
    }

    find(): Promise<RendererRecord[]> {
        return Promise.all(
            Array.from(this._renderers.values(), this._toRenderRecord)
        )
    }

    async remove(id: RendererRecord['_id'], params?: Params): Promise<RendererRecord> {

        if (params?.provider)
            throw new MethodNotAllowed('renderers cannot be removed')

        if (id === SERVER_RENDERER_ID)
            throw new MethodNotAllowed('server renderer cannot be removed')

        const renderer = await this._assertGetRenderer(id)

        if (isClientRenderAgent(renderer) && renderer.socket.connected)
            renderer.socket.disconnect()

        this._renderers.delete(id)

        this._rebalanceQueue(
            renderer.items()
        )

        return this._toRenderRecord(renderer)
    }

    /**
     * Disconnect all renderers when the app shuts down
     */
    async teardown(): Promise<void> {

        for await (const socket of this._sockets())
            socket.disconnect()
    
    }

    /*** Non Service Interface ***/

    readonly ensureFileQueued = (_file: File): void => {

        // TODO
        // - if renderable file
        // - if renders not already queued
        // - if renders not already made
        // - send to queue

    }

    readonly ensureFileUnqueued = (_file: File): void => {

        // TODO
        // - if renders queued
        // - remove from queue

    }

    /**
     * Promise that resolves once all render queues are empty
     */
    untilAllRenderersIdle(): Promise<void> {
        return reduceToVoid(
            Array.from(
                this._renderers.values(), 
                renderer => renderer.complete()
            )
        )
    }

    // Helper

    private readonly _toRenderRecord = (
        renderer: Renderer | ClientRendererAgent
    ): RendererRecord =>{

        const _id = isClientRenderAgent(renderer) 
            ? renderer.socket.id 
            : SERVER_RENDERER_ID

        const maxConcurrent = renderer.config.maxConcurrent

        const items = renderer
            .items()
            .map(({ stage, id, setting }) => ({
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

    private _rebalanceQueue(items: RenderItem[] = []): void {
        // Ensure each renderer has an equal load of work
    }

    private async _getConnectionSocket(params?: Params): Promise<Socket | null> {

        if (!params?.connection || params?.provider !== 'socketio')
            return null

        for await (const socket of this._sockets()) {
            if ((socket as any).feathers === params.connection)
                return socket
        }

        return null
    }

    private async * _sockets() {

        const io = await this._io

        return yield* io.sockets.sockets.values()
    }

    private _assertGetRenderer (
        id: RendererRecord['_id']
    ): Promise<Renderer | ClientRendererAgent> {

        const renderer = this._renderers.get(id)
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
    RenderServiceSettings,

    RendererRecord
}