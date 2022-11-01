import { Server, Socket } from 'socket.io'
import { EventEmitter } from 'events'

import Renderer, {
    RendererConfig,
} from '@benzed/renderer'

import { Params } from '@feathersjs/feathers'

import {
    NotFound, 
    BadRequest, 
    MethodNotAllowed
} from '@feathersjs/errors'

import { File } from '../files-service/schema'

import { FeathersFileService } from '../files-service/middleware/util'
import { RenderAgent, RenderAgentData, RenderAgentResult } from './render-agent'

import { 
    SERVER_RENDERER_ID 
} from '../files-service/constants'

import { reduceToVoid, by } from '@benzed/util'
import { QueuePayload } from '@benzed/async'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Types ***/

interface RenderServiceSettings extends RendererConfig {
    io: Server | Promise<Server>
    files: FeathersFileService
}

/*** Helper ***/

const isEventEmitter = (value: object): value is EventEmitter => `emit` in value

/*** Main ***/

class RenderService {

    private readonly _renderAgents: Map<string, RenderAgent>
    get renderAgents(): RenderAgent[] {
        return Array.from(this._renderAgents.values())
    }

    private readonly _files: FeathersFileService
    private readonly _io: Server | Promise<Server>

    readonly settings: RendererConfig['settings']

    constructor (serviceSettings: RenderServiceSettings) {
        const {
            io,
            files,
            settings,
        } = serviceSettings

        this.settings = settings

        this._io = io
        this._renderAgents = new Map() 
        this._files = files
    }

    /*** Service Interface ***/

    async create(
        _data: object, 
        params?: Params
    ): Promise<RendererConfig & RenderAgentData> {

        const socket = await this._getConnectionSocket(params)
        if (!socket)
            throw new MethodNotAllowed(`Only socket.io clients may create a renderer`)

        const existing = this._renderAgents.get(socket.id)
        if (existing)
            throw new BadRequest(`Renderer already created for this connection`)

        const { settings } = this

        this._createRenderAgent(socket)

        socket.once(`disconnect`, () => {
            if (this._renderAgents.has(socket.id)) 
                this.remove(socket.id)
        })

        this._rebalanceQueue([])

        return {
            ...await this.get(socket.id),
            settings
        }
    }

    async get (id: RenderAgentData['_id']): Promise<RenderAgentData> {

        const renderer = await this._assertGetRenderer(id)
        return this._toRenderRecord(renderer)
    }

    find(): Promise<RenderAgentData[]> {
        return Promise.all(
            Array.from(
                this._renderAgents.values(), 
                this._toRenderRecord
            )
        )
    }

    async remove(id: RenderAgentData['_id'], params?: Params): Promise<RenderAgentData> {

        if (params?.provider)
            throw new MethodNotAllowed(`Method 'remove' not allowed`)

        const renderer = await this._assertGetRenderer(id)

        if (renderer.agent instanceof Socket && renderer.agent.connected)
            renderer.agent.disconnect()

        this._renderAgents.delete(id)
 
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

    setup(): Promise<void> {
        this._files.on(`patched`, this.ensureFileQueued.bind(this))
        this._files.on(`removed`, this.ensureFileUnqueued.bind(this))
        return Promise.resolve()
    }

    /*** Non Service Interface ***/

    /**
     * Promise that resolves once all render queues are empty
     */
    untilAllRenderAgentsIdle(): Promise<void> {
        return reduceToVoid(
            Array.from(
                this._renderAgents.values(), 
                renderer => renderer.complete()
            )
        )
    }

    isRenderable(file: File): boolean {

        const [broadType] = file.type.split(`/`)

        const types = Object.values(this.settings).map(s => s.type)
        if (types.includes(`video`) && broadType === `video`)
            return true 

        if (types.includes(`image`) && broadType === `video` || broadType === `image`)
            return true 

        if (types.includes(`audio`) && broadType === `audio`)
            return true 

        return false
    }

    ensureFileQueued (file: File): void {

        const requiresRendering = file.renders.length === 0
        const isRenderable = this.isRenderable(file)
        if (!requiresRendering || !isRenderable)
            return

        const isQueued = this.renderAgents.some(agent => agent.isQueued(file))
        if (isQueued)
            return

        // create local renderer if we have no connected clients
        const hasNoAgents = this.renderAgents.length === 0
        if (hasNoAgents) {
            this._createRenderAgent(
                new Renderer({ settings: this.settings })
            )
        }

        const [ leastBusy ] = this.renderAgents.sort(by(r => r.files.length))
        leastBusy.render(file)
    }

    ensureFileUnqueued (_file: File): void {

        // TODO
        // - if renders queued
        // - remove from queue

    }

    // Helper

    private _tryEmit (event: 'updated' | 'created', record: RenderAgentData): void {
        if (isEventEmitter(this)) 
            this.emit(event, record)
    }

    private _createRenderAgent(agent: Socket | Renderer): RenderAgent {

        const renderAgent = new RenderAgent(agent)
        if (this._renderAgents.has(renderAgent._id))
            throw new Error(`Agent already exists for id '${renderAgent._id}'`)

        const onRenderAgentUpdate = (
            { item }: QueuePayload<RenderAgentResult[], { fileId: string }>
        ): void => {
            this._tryEmit(
                `updated`,
                renderAgent.toJSON()
            )

            const settings = item.result?.value.map(({ setting }) => ({ 
                key: setting, 
                size: 1, 
                rendered: new Date() 
            })) ?? []
            this._files.patch(item.fileId, { renders: settings })
        }

        renderAgent.queue.on(`start`, onRenderAgentUpdate)
        renderAgent.queue.on(`error`, onRenderAgentUpdate)
        renderAgent.queue.on(`complete`, onRenderAgentUpdate)

        this._renderAgents.set(renderAgent._id, renderAgent)
        return renderAgent
    }
    
    private readonly _toRenderRecord = (
        { _id, files }: RenderAgent
    ): RenderAgentData =>{
        return { 
            _id, 
            files 
        }
    }

    private _rebalanceQueue(files: RenderAgentData['files']): void {
        // Ensure each renderer has an equal load of work
    }

    private async _getConnectionSocket(params?: Params): Promise<Socket | null> {

        if (!params?.connection || params?.provider !== `socketio`)
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
        id: RenderAgentData['_id']
    ): Promise<RenderAgent> {

        const renderer = this._renderAgents.get(id)
        if (!renderer) {
            return Promise.reject(
                new NotFound(
                    id === SERVER_RENDERER_ID 
                        ? `Server renderer not found`
                        : `Renderer could not be found for id '${id}'`
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

    RenderAgentData
}