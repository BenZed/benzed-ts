import configuration from '@feathersjs/configuration'

import createFileServer, { FileServerConfig } from '../../../create-file-server-app'
import RenderService from './render-service'

import createClientRenderer from './client-renderer'

/*** Test Server ***/

const server = createFileServer()
beforeAll(() => server.start())
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

    it('adds a client renderer', async () => {

        const client = createClientRenderer(`http://localhost${server.get('port')}`)

        const result = await server.service('files/render').create({})

        console.log(result)
    })

})

it.todo('handles file render requests')

it.todo('delegates render requests')