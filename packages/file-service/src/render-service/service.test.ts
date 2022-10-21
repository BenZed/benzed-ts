import { omit } from '@benzed/util'
import { milliseconds } from '@benzed/async'
import { RendererConfig } from '@benzed/renderer'

import configuration from '@feathersjs/configuration'
import { FeathersService } from '@feathersjs/feathers'

import RenderService, { RenderAgentData } from './service'
import createFileRenderApp, { FileRenderApp } from '../client'
import createFileServer, { FileServerConfig } from '../server'
import { TEST_FILE_SERVER_CONFIG } from '../util.test'

import { expect, it, describe, beforeAll, afterAll } from '@jest/globals'
import { SERVER_RENDERER_ID } from '../files-service'
/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

const server = createFileServer()

/*** Test Server ***/

const CLIENT = {
    host: `http://localhost:${server.get(`port`)}`,
    auth: {
        strategy: `local`,
        email: `render-test-user@email.com`,
        password: `password`
    }
}

beforeAll(() => server.start())

beforeAll(async () => {
    const users = server.service(`users`)
    
    await users.create({
        name: `Test User`,
        ...omit(CLIENT.auth, `strategy`),
    })

})

let client: FileRenderApp
let clientRenderService: FeathersService<FileRenderApp, RenderService>
let clientRenderAgentData: RendererConfig & RenderAgentData

//
beforeAll(async () => {

    client = await createFileRenderApp(CLIENT)

    clientRenderService = client.service(`files/render`)

    clientRenderAgentData = await clientRenderService.create({
        maxConcurrent: 1
    }).catch(e => e)

})

afterAll(() => void client.io.connected && client.io.disconnect())
afterAll(() => server.teardown())

/*** Test ***/

it(`render service is attached via the file service`, () => {
    expect(
        server.service(`files/render`)
    ).toBeInstanceOf(RenderService)
})

it(`render service is not attached if a renderer config is not provided`, () => {

    const noRenderServer = createFileServer({
        ...configuration()() as unknown as FileServerConfig,
        renderer: null
    })

    expect(() => 
        noRenderServer.service(`files/render`)
    ).toThrow(`Can not find service 'files/render'`)

})

describe(`create()`, () => {

    let createEventArg: RenderAgentData
    beforeAll(() => {
        clientRenderService.on(`created`, (r: RenderAgentData) => {
            createEventArg = r
        })
    })

    it(`can only be called by client`, async () => {
        const err = await server
            .service(`files/render`)
            .create({ maxConcurrent: 1 })
            .catch((err: Error) => err) as Error

        expect(err.message)
            .toContain(`only socket.io clients may create a renderer`)

    })

    it(`adds a client renderer`, () => {
        expect(clientRenderAgentData._id).toBeTruthy()
    })

    it(`client cannot create multiple renderers`, async () => {
        const err = await clientRenderService.create({ maxConcurrent: 2 }).catch(e => e)
        expect(err).toHaveProperty(
            `message`, 
            `renderer already created for this connection`
        )
    })

    it(`clients receive render settings along with record`, () => {
        expect(clientRenderAgentData).toHaveProperty(
            `settings`, 
            TEST_FILE_SERVER_CONFIG.renderer?.settings
        )
    })

    it(`emits created event`, async () => {

        const client2 = await createFileRenderApp(CLIENT)

        await client2.service(`files/render`).create({ 
            maxConcurrent: 1
        })

        client2.io.disconnect()

        expect(createEventArg).toBeTruthy()
    })

})

describe(`get()`, () => {

    it(`gets render records by id`, async () => {
        const record = await clientRenderService.get(clientRenderAgentData._id)
        expect(record).toEqual(omit(clientRenderAgentData, `settings`))
    })

    it(`use id ${SERVER_RENDERER_ID} to get salerver renderer`, async () => {
        const serverRecord = await clientRenderService.get(SERVER_RENDERER_ID)
        expect(serverRecord).toEqual({
            _id: SERVER_RENDERER_ID,
            files: []
        })
    })
})

describe(`find()`, () => {

    it(`resolves an array of all renderers`, async () => {
        const records = await clientRenderService.find()
        expect(records.length).toBeGreaterThan(0)
    })

})

describe(`update() & patch()`, () => {

    let updateEventArg: RenderAgentData
    beforeAll(() => {
        clientRenderService.on(`updated`, (renderer: RenderAgentData) => {
            updateEventArg = renderer
        })
    })

    for (const method of [`patch`, `update`]) {
        it(`${method}() disabled`, async () => {

            const err = await (clientRenderService as any)[method](
                clientRenderAgentData._id,
                {
                    items: []
                }
            ).catch((e: Error) => e)

            expect(err.message).toContain(`Method \'${method}\' not allowed`)
            expect(err.name).toBe(`MethodNotAllowed`)

        })
    }

    it(`updated events are still emitted`, async () => {

        const renderer: RenderAgentData = await clientRenderService
            .get(clientRenderAgentData._id)
        
        server
            .service(`files/render`)
            .emit(`updated`, renderer)
       
        await milliseconds(25)

        expect(updateEventArg).toEqual(renderer)
        
    })

})

describe(`remove()`, () => {

    let removeEventArg: RenderAgentData
    beforeAll(() => {
        clientRenderService.on(`removed`, (r: RenderAgentData) => {
            removeEventArg = r
        })
    })

    it(`disallowed by client`, async () => {
        const err = await clientRenderService
            .remove(clientRenderAgentData._id)
            .catch((e: Error) => e) as Error

        expect(err.message)
            .toContain(`Method 'remove' not allowed`)
    })

    it(`removing server renderer is disallowed`, async () => {
        const err = await server.service(`files/render`)
            .remove(`local`)
            .catch((e: Error) => e) as Error

        expect(err.message)
            .toContain(`Server renderer cannot be removed`)
    })

    it(`removes the renderer from the list of renders`, async () => {
        const client = await createFileRenderApp(CLIENT)

        const r = await client.service(`files/render`).create({ maxConcurrent: 1 })
        await server.service(`files/render`).remove(r._id)

        expect(
            
            await server
                .service(`files/render`)
                .find()
                .then(r => r.map(r => r._id))
        
        ).not.toContain(r._id)

    })

    it(`disconnected clients are automatically removed`, async () => {

        const client = await createFileRenderApp(CLIENT)
        
        const renderer = await client
            .service(`files/render`)
            .create({ maxConcurrent: 1 })

        client.io.disconnect()

        await milliseconds(50)

        const error = await server.service(`files/render`)
            .get(renderer._id)
            .catch((e: Error) => e) as Error

        expect(error.message).toContain(`renderer could not be found for id`)

    })

    it(`emits remove event`, () => {
        expect(removeEventArg).toBeTruthy()
    })

})