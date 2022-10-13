
import { milliseconds } from '@benzed/async'

import configuration from '@feathersjs/configuration'
import { FeathersService } from '@feathersjs/feathers'

import RenderService, { RendererRecord } from './service'
import createClientRenderer, { ClientRenderer } from './client-renderer'
import createFileServer, { FileServerConfig } from '../../../create-file-server-app'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

const server = createFileServer()

/*** Test Server ***/

const HOST = `http://localhost:${server.get('port')}`

beforeAll(() => server.start())

let client: ClientRenderer
let clientRenderService: FeathersService<ClientRenderer, RenderService>
let clientRendererRecord: RendererRecord

//
beforeAll(async () => {

    client = await createClientRenderer(HOST)

    clientRenderService = client.service('files/render')

    clientRendererRecord = await clientRenderService.create({
        maxConcurrent: 1
    })
})

afterAll(() => client.io.connected && client.io.disconnect())
afterAll(() => server.teardown())

/*** Test ***/

it('render service is attached via the file service', () => {
    expect(
        server.service('files/render')
    ).toBeInstanceOf(RenderService)
})

it('render service is not attached if a renderer config is not provided', () => {

    const noRenderServer = createFileServer({
        ...configuration()() as unknown as FileServerConfig,
        renderer: null
    })

    expect(() => 
        noRenderServer.service('files/render')
    ).toThrow('Can not find service \'files/render\'')

})

describe('create()', () => {

    it('can only be called by client', async () => {
        const err = await server
            .service('files/render')
            .create({ maxConcurrent: 1 })
            .catch((err: Error) => err) as Error

        expect(err.message)
            .toContain('only socket.io clients may create a renderer')

    })

    it('adds a client renderer', () => {
        expect(clientRendererRecord._id).toBeTruthy()
    })

    it('client cannot create multiple renderers', async () => {
        const err = await clientRenderService.create({ maxConcurrent: 2 }).catch(e => e)
        expect(err).toHaveProperty(
            'message', 
            'renderer already created for this connection'
        )

    })

    it('client renderer must provide a valid maxConcurrent number', async () => {

        const required = await clientRenderService
            .create({ } as any)
            .catch(e => e)

        expect(required.message)
            .toContain('is required')

        const invalid = await clientRenderService
            .create({ maxConcurrent: 0 })   
            .catch(e => e)

        expect(invalid.message)
            .toContain('must be above 0')
    })

})

describe('get()', () => {

    it('gets render records by id', async () => {
        const record = await clientRenderService.get(clientRendererRecord._id)

        expect(record).toEqual(clientRendererRecord)
    })

    it('use id "server" to get salerver renderer', async () => {

        const serverRecord = await clientRenderService.get('local')

        expect(serverRecord).toEqual({
            _id: 'local',
            maxConcurrent: 1,
            items: []
        })
    })
})

describe('find()', () => {

    it('resolves an array of all renderers', async () => {
        const records = await clientRenderService.find()

        expect(records.length).toBeGreaterThan(0)
    })

})

describe('patch()', () => {

    it('disabled for clients', async () => {

        const err = await clientRenderService.patch(
            clientRendererRecord._id,
            {
                items: []
            }
        ).catch(e => e)

        expect(err.message).toContain('renderers cannot be patched')
        expect(err.name).toBe('MethodNotAllowed')

    })

})

describe('remove()', () => {

    let removeEventArg: RendererRecord
    beforeAll(() => {
        clientRenderService.on('removed', (r: RendererRecord) => {
            removeEventArg = r
        })
    })

    it('disallowed by client', async () => {
        const err = await clientRenderService
            .remove(clientRendererRecord._id)
            .catch((e: Error) => e) as Error

        expect(err.message)
            .toContain('renderers cannot be removed')
    })

    it('removing server renderer is disallowed', async () => {
        const err = await server.service('files/render')
            .remove('local')
            .catch((e: Error) => e) as Error

        expect(err.message)
            .toContain('server renderer cannot be removed')
    })

    it('removes the renderer from the list of renders', async () => {
        const client = await createClientRenderer(HOST)

        const r = await client.service('files/render').create({ maxConcurrent: 1 })
        await server.service('files/render').remove(r._id)

        expect(
            
            await server
                .service('files/render')
                .find()
                .then(r => r.map(r => r._id))
        
        ).not.toContain(r._id)

    })

    it('disconnected clients are automatically removed', async () => {

        const client = await createClientRenderer(HOST)
        
        const r = await client
            .service('files/render')
            .create({ maxConcurrent: 1 })
        
        client.io.disconnect()
        await milliseconds(50)

        const error = await server.service('files/render')
            .get(r._id)
            .catch((e: Error) => e) as Error

        expect(error.message).toContain('renderer could not be found for id')

    })

    it('emits remove event', () => {

        expect(removeEventArg).toBeTruthy()

    })

})