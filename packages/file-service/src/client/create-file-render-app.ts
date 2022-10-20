import socketio, { Socket } from 'socket.io-client'
import { Readable, Writable } from 'stream'

import { feathers, Application } from '@feathersjs/feathers'
import fsocketio from '@feathersjs/socketio-client'
import fauth from '@feathersjs/authentication-client'
import type { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication'

import { Renderer } from '@benzed/renderer'
import { through, toNull } from '@benzed/util'
import fs from '@benzed/fs'

import { RenderService } from '../render-service'
import { File, FileService } from '../files-service'

/*** Types ***/

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

    start(): Promise<void>

}

interface FileRenderAppSettings {
    host: string
    auth?: AuthenticationRequest
}

/*** Helper ***/

function clientDownload(
    _host: string,
    _client: FileRenderApp,
    file: File
): Readable {
    // TEMP 
    const filePath = `./storage/test/files/${file._id}/${file.name}${file.ext}`
    return fs.createReadStream(filePath)
}

function clientUpload(
    _host: string,
    _client: FileRenderApp,
    file: File,
    setting: string,
    ext: string
): Writable {
    // TEMP obv
    const filePreviewPath = `./storage/test/files/${file._id}/render/${setting}${ext}`
    return fs.createWriteStream(filePreviewPath)
}

function untilConnect(client: FileRenderApp): Promise<void> {
    return new Promise(resolve => 
        client.io.on(
            'connect', 
            resolve
        )
    )
}

async function startFileRenderApp(
    this: FileRenderApp
): Promise<void> {

    const service = this.service('files/render')
    const host = this.get('host')

    const renderer = new Renderer(await service.create({ maxConcurrent: 1 }))
    this.set('renderer', renderer)

    this.io.on(
        'render', 
        async (file: File, reply: (err: Error | null) => void) => {

            const items = renderer.add({
                id: file._id,
                source: clientDownload(host, this, file),
                target: ({ setting, ext }) => clientUpload(host, this, file, setting, ext)
            })

            const error = await Promise
                .all(items.map(item => item.complete()))
                .then(toNull)
                .catch(through<Error>)

            reply(error)
        }
    )
}

/*** Main ***/

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
    app.start = startFileRenderApp
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
    await untilConnect(app)
    if (auth) 
        await app.authenticate(auth)

    return app
}

/*** Exports ***/

export {
    createFileRenderApp,
    FileRenderApp,

}

