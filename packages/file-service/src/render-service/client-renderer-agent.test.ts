import { User } from '../server/services/users'
import { HOST, Uploader } from '../util.test'
import createFileServerApp from '../server/create-file-server-app'

import { RendererRecord } from './service'
import createClientRenderer, { ClientRenderer } from './client-renderer'

import { beforeAll, afterAll, it } from '@jest/globals'
import { SignedFile } from '../files-service'

/*** Const ***/

const PASSWORD = 'some-test-password'

/*** Setup ***/

const server = createFileServerApp()
const users = server.service('users')
const render = server.service('files/render')

const upload = new Uploader(server)

beforeAll(() => server.start())

// create upload user
let uploader: User
beforeAll(async () => {
    uploader = await users.create({
        name: 'Test User',
        email: 'test@user.com',
        password: PASSWORD
    })
})

// listen for render events
const renderEvents = {
    updated: [] as RendererRecord[],
    created: [] as RendererRecord[],
    removed: [] as RendererRecord[]
}
beforeAll(() => {
    for (const event of ['updated', 'created', 'removed'] as const)
        render.on(event, r => renderEvents[event].push(r))
})

// create client renderers
const clients = [] as unknown as [ClientRenderer, ClientRenderer, ClientRenderer]
beforeAll(async () => {

    for (const clientIndex of [0,1,2] as const) {

        const client = await createClientRenderer({
            host: HOST,
            auth: {
                email: uploader.email,
                password: PASSWORD,
                strategy: 'local'
            }
        })

        await client
            .service('files/render')
            .create({
                maxConcurrent: clientIndex + 1
            })

        clients[clientIndex] = client
    }

})

// upload test files
let uploadedFiles: SignedFile[]
beforeAll(async () => {
    uploadedFiles = await upload.assets(uploader._id)
        .then(data => data.map(datum => datum.signedFile))

    await render.untilAllRenderersIdle()
})

afterAll(() => server.teardown())

/*** Tests ***/

it('renders files uploaded to the server', () => {
    console.log(renderEvents)
})