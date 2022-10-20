
import {
    Renderer,
} from '@benzed/renderer'

import {
    Queue
} from '@benzed/async'

import fs from '@benzed/fs'
import path from 'path'

import { Socket } from 'socket.io'
import { getFsFilePath } from '../files-service/middleware/util'
import { File, SERVER_RENDERER_ID } from '../files-service'
import { RendererRecord } from './service'
import { RENDER_DIR_NAME } from '../files-service/constants'

/*** Main ***/

/**
 * Doesn't actually do any rendering, acts as an agent representing a client
 * renderer.
 */
class RenderAgent implements RendererRecord {

    readonly maxConcurrent = 1

    private readonly _queue = new Queue<void, { fileId: string }>()

    constructor (
        readonly agent: Renderer | Socket
    ) {}
    
    get _id(): string {
        const { agent } = this
        return agent instanceof Renderer    
            ? SERVER_RENDERER_ID
            : agent.id
    }

    get files(): string[] {
        return [
            ...this._queue.queuedItems,
            ...this._queue.currentItems
        ].map(i => i.fileId)
    }

    render(file: File): void {
        this._queue.add({
            fileId: file._id,
            task: () => {
                const { agent } = this
                return agent instanceof Renderer
                    ? this._renderLocal(agent, file)
                    : this._renderNetwork(agent, file)
            }
        })
    }

    complete(): Promise<void> {
        const { agent } = this
        return agent instanceof Renderer   
            ? agent.complete()
            : Promise.resolve()
    }

    protected _renderLocal(agent: Renderer, file: File): Promise<void> {

        agent.add({
            // TEMP
            source: fs.createReadStream(
                getFsFilePath(
                    file,
                    './storage/test/files'
                )
            ),
            // TEMP
            target: ({ setting, ext }) => fs.createWriteStream(
                path.join(
                    path.dirname(
                        getFsFilePath(
                            file,
                            './storage/test/files'
                        )
                    ),
                    RENDER_DIR_NAME,
                    `${setting}${ext}`
                )
            )
        })

        return agent.complete()
    }

    protected _renderNetwork(
        socket: Socket, 
        file: File
    ): Promise<void> {

        return new Promise((resolve, reject) => {
            socket.emit('render', file, (err: Error | null) => {
                console.log('response', file.name, err?.message)
                return err 
                    ? reject(err) 
                    : resolve() 
            })
            socket.on('disconnect', () => reject(new Error('client disconnected')))
        })

    }

}

/*** Exports ***/

export default RenderAgent

export {
    RenderAgent
}