import { Server, Socket } from 'socket.io'

import Renderer, {
    $rendererConfig,
    RendererConfig,
} from '@benzed/renderer'

import {
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
import { RenderAgent } from './render-agent'

import { 
    SERVER_RENDERER_ID 
} from '../files-service/constants'

import { 
    $rendererRecordCreateData,
    RendererRecordCreateData,
} from './schema'

import { reduceToVoid, by } from '@benzed/util'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

interface RendererRecord extends RendererRecordCreateData {
    _id: string
    files: string[]
}

interface RenderServiceSettings extends RendererConfig {
    io: Server | Promise<Server>
    files: FeathersFileService
}

/*** Helper ***/

const assertCreateData: Asserts<typeof $rendererConfig> = $rendererRecordCreateData.assert

/*** Main ***/

class RenderService {

    private readonly _agents: Map<string, RenderAgent>
    get agents(): RenderAgent[] {
        return Array.from(this._agents.values())
    }

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
        this._agents = new Map() 
        if (maxConcurrent > 0) {
            this._agents.set(
                SERVER_RENDERER_ID,
                new RenderAgent(
                    new Renderer({ maxConcurrent, settings })
                )
            )
        }

        this._files = files
        this._files.on('patched', this.ensureFileQueued)
        this._files.on('removed', this.ensureFileUnqueued)
    }

    /*** Service Interface ***/

    async create(
        data: RendererRecordCreateData, 
        params?: Params
    ): Promise<RendererConfig & RendererRecord> {

        try {
            assertCreateData(data)
        } catch (e) {
            throw validationErrorToBadRequest(e as ValidationError)
        }
        
        const socket = await this._getConnectionSocket(params)
        if (!socket)
            throw new MethodNotAllowed('only socket.io clients may create a renderer')

        const existing = this._agents.get(socket.id)
        if (existing)
            throw new BadRequest('renderer already created for this connection')

        const { settings } = this

        this._agents.set(
            socket.id,
            new RenderAgent([socket, this._files])
        )

        socket.once('disconnect', () => {
            if (this._agents.has(socket.id)) 
                this.remove(socket.id)
        })

        this._rebalanceQueue()

        return {
            ...await this.get(socket.id),
            settings
        }
    }

    update(
        id: RendererRecord['_id'],
        data: Omit<RendererRecord, '_id'>,
        params?: Params    
    ): Promise<RendererRecord> {

        if (params?.provider) 
            throw new MethodNotAllowed('cannot update renderers')

        return Promise.resolve({
            ...data,
            _id: id
        })
    }

    async get (id: RendererRecord['_id']): Promise<RendererRecord> {

        const renderer = await this._assertGetRenderer(id)
        return this._toRenderRecord(renderer)
    }

    find(): Promise<RendererRecord[]> {
        return Promise.all(
            Array.from(this._agents.values(), this._toRenderRecord)
        )
    }

    async remove(id: RendererRecord['_id'], params?: Params): Promise<RendererRecord> {

        if (params?.provider)
            throw new MethodNotAllowed('renderers cannot be removed')

        if (id === SERVER_RENDERER_ID)
            throw new MethodNotAllowed('server renderer cannot be removed')

        const renderer = await this._assertGetRenderer(id)

        if (renderer.agent instanceof Socket && renderer.agent.connected)
            renderer.agent.disconnect()

        this._agents.delete(id)
 
        this._rebalanceQueue(renderer.files)

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

    /**
     * Promise that resolves once all render queues are empty
     */
    untilAllRenderersIdle(): Promise<void> {
        return reduceToVoid(
            Array.from(
                this._agents.values(), 
                renderer => renderer.complete()
            )
        )
    }

    readonly ensureFileQueued = (file: File): void => {

        const isQueued = this.agents.some(agent => 
            agent.files.some(fileId => file._id === fileId)
        )
        if (isQueued)
            return 
        
        const [ best ] = this.agents.sort(by(r => r.files.length))

        best.render(file)
        // just to emit the events
        void this.update(
            best._id, { 
                files: best.files,
                maxConcurrent: 1
            }
        )
    }

    readonly ensureFileUnqueued = (_file: File): void => {

        // TODO
        // - if renders queued
        // - remove from queue

    }

    // Helper

    private readonly _toRenderRecord = (
        { _id, files }: RenderAgent
    ): RendererRecord =>{
        return { 
            _id, 
            files, 
            maxConcurrent: 1 
        }
    }

    private _rebalanceQueue(files: string[] = []): void {
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

    private async * _sockets(): AsyncGenerator<Socket, undefined, undefined> {

        const io = await this._io

        return yield* io.sockets.sockets.values()
    }

    private _assertGetRenderer (
        id: RendererRecord['_id']
    ): Promise<RenderAgent> {

        const renderer = this._agents.get(id)
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