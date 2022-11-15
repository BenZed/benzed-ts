import socketio, { Socket } from 'socket.io-client'

import { Renderer, RenderItem } from '@benzed/renderer'

import { feathers, Application } from '@feathersjs/feathers'
import type { 
    AuthenticationRequest, 
    AuthenticationResult 
} from '@feathersjs/authentication'
import fauth from '@feathersjs/authentication-client'
import fsocketio from '@feathersjs/socketio-client'

import { RenderService } from '../render-service'
import { File, FileService } from '../files-service'

import clientDownload from './client-download'
import clientUpload from './client-upload'
import { getRenderAgentResults, RenderAgentResult } from '../render-service/render-agent'

//// Types ////

interface FileRenderApp extends 
    Application<
    { 
        'files': FileService 
        'files/render': RenderService 
    }, {
        renderer: Renderer | null
        host: string
    }> {

    io: Socket 

    authenticate(req: AuthenticationRequest): Promise<AuthenticationResult>

    connect(): Promise<void>
    start(): Promise<void>

    render(file: File): Promise<RenderItem[]>

}

interface FileRenderAppSettings {
    host: string
    auth?: AuthenticationRequest
}

//// Helper ////

function untilConnect(this: FileRenderApp): Promise<void> {
    return new Promise(resolve => 
        this.io.on(
            'connect', 
            resolve
        )
    )
}

async function start(
    this: FileRenderApp
): Promise<void> {

    const service = this.service('files/render')
    const host = this.get('host')

    const { settings } = await service.create({ maxConcurrent: 1 })

    const renderer = new Renderer({ 
        settings, 
        maxConcurrent: Object.keys(settings).length 
    })

    this.set('renderer', renderer)
    this.io.on('render', async (
        file: File, 
        reply: (data: RenderAgentResult[]) => void
    ) => {

        renderer.add({
            id: file._id,
            source: clientDownload(host, file),
            target: target => clientUpload(host, file, target)
        })

        const results = await getRenderAgentResults(renderer)
        reply(results)

    })
}

//// Main ////

export default async function createFileRenderApp(
    config: FileRenderAppSettings
): Promise<FileRenderApp> {

    const { host, auth } = config

    // Create App
    const app = feathers()
        .configure(
            fsocketio(
                socketio(host)
            )
        ) as FileRenderApp

    app.connect = untilConnect
    app.start = start

    app.set('host', host)

    // Setup Auth
    if (auth) {
        app.configure(
            fauth({
                storageKey: 'benzed-client-renderer'
            })
        )
    }

    // Connect & Optionally Login
    await app.connect()
    if (auth) 
        await app.authenticate(auth)

    return app
}

//// Exports ////

export {
    createFileRenderApp,
    FileRenderApp,
    FileRenderAppSettings,

    getRenderAgentResults

}

