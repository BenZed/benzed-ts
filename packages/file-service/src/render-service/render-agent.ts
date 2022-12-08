import { pick } from '@benzed/util'

import {
    Renderer,
} from '@benzed/renderer'

import {
    Queue, 
    QueueItem
} from '@benzed/async'

import fs from '@benzed/fs'

import path from 'path'
import { Socket } from 'socket.io'

import { File, SERVER_RENDERER_ID } from '../files-service'
import { RENDER_DIR_NAME } from '../files-service/constants'
import { getFsFilePath } from '../files-service/middleware/util'

//// Types ////

interface RenderAgentResult {
    readonly error: Error | null
    readonly setting: string
}

interface RenderAgentData {
    readonly _id: string
    readonly files: readonly { 
        readonly _id: string
        readonly results: readonly RenderAgentResult[] 
    }[]
}

//// Helper ////

async function getRenderAgentResults(renderer: Renderer): Promise<RenderAgentResult[]> {

    const items = renderer.items()

    await renderer.complete()

    return items.map(({ error, setting }) => ({
        error: error && pick(error, `message`, `name`),
        setting
    }))
}

//// Main ////

class RenderAgent implements RenderAgentData {

    readonly queue = new Queue<RenderAgentResult[], { fileId: string }>()
    
    get _id(): string {
        const { agent } = this
        return agent instanceof Renderer    
            ? SERVER_RENDERER_ID
            : agent.id
    }

    private readonly _files: Map<string, RenderAgentResult[]> = new Map()
    get files(): RenderAgentData['files'] {
        return Array
            .from(this._files)
            .map(([_id, results]) => ({ _id, results }))
    }

    //// Constructor ////
    
    constructor (
        readonly agent: Renderer | Socket,
    ) { }

    //// Interface ////

    render(file: File): QueueItem<RenderAgentResult[], { fileId: string }> {

        this._files.set(file._id, [])

        return this.queue.add({
            fileId: file._id,
            task: async () => {
                const { agent } = this

                const results = await (agent instanceof Renderer
                    ? this._renderLocal(agent, file)
                    : this._renderNetwork(agent, file))
                
                this._files.set(file._id, results)

                return results
            }
        })
    }

    isQueued(file: File): boolean {
        return [
            ...this.queue.queuedItems,
            ...this.queue.currentItems
        ].some(i => i.fileId === file._id)
    }

    complete(): Promise<void> {
        return this.queue.complete()
    }

    //// To Json ////
    
    toJSON(): RenderAgentData {
        return pick(this, `_id`, `files`)
    }

    //// Helper ////
    
    protected _renderLocal(agent: Renderer, file: File): Promise<RenderAgentResult[]> {

        agent.add({
            // TEMP
            source: fs.createReadStream(
                getFsFilePath(
                    file,
                    `./storage/test/files`
                )
            ),
            // TEMP
            target: ({ setting, ext }) => fs.createWriteStream(
                path.join(
                    path.dirname(
                        getFsFilePath(
                            file,
                            `./storage/test/files`
                        )
                    ),
                    RENDER_DIR_NAME,
                    `${setting}${ext}`
                )
            )
        })

        return getRenderAgentResults(agent)
    }

    protected _renderNetwork(
        socket: Socket, 
        file: File
    ): Promise<RenderAgentResult[]> {
        return new Promise((resolve, reject) => {

            socket.emit(
                `render`, 
                file, 
                (data: RenderAgentResult[]) => resolve(data)
            )
            
            socket.once(`disconnect`, () => 
                reject(
                    new Error(`client disconnected`)
                )
            )
        })
    }
}

//// Exports ////

export default RenderAgent

export {
    RenderAgent,
    RenderAgentData,

    getRenderAgentResults,
    RenderAgentResult
}