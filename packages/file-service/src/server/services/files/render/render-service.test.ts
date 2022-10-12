
import createFileServer from '../../../create-file-server-app'
import RenderService from './render-service'

const server = createFileServer()

it('render service is attached via the file service', () => {

    expect(
        server.service('files/render')
    ).toBeInstanceOf(RenderService)

})

it.todo('handles file render requests')

it.todo('delegates render requests')