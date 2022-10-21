import { unique } from '@benzed/array'

import { User } from '../server/services/users'
import createFileServerApp from '../server/create-file-server-app'
import { HOST, Uploader } from '../util.test'

import { File, SignedFile } from '../files-service'
import { RenderAgentData } from './render-agent'
import {
    createFileRenderApp,
    FileRenderApp 
} from '../client/create-file-render-app'

/*** Const ***/

const PASSWORD = `some-test-password`
const TEST_CLIENT_RENDERERS = 0

/*** Setup ***/

const server = createFileServerApp()
const users = server.service(`users`)
const render = server.service(`files/render`)

const upload = new Uploader(server)

beforeAll(() => server.start())

// create upload user
let uploader: User
beforeAll(async () => {
    uploader = await users.create({
        name: `Test User`,
        email: `test@user.com`,
        password: PASSWORD
    })
})

// listen for render events
const renderEvents = {
    updated: [] as RenderAgentData[],
    created: [] as RenderAgentData[],
    removed: [] as RenderAgentData[]
}
beforeAll(() => {
    for (const event of [`updated`, `created`, `removed`] as const)
        render.on(event, r => renderEvents[event].push(r))
})

// create client renderers
const clients: FileRenderApp[] = []
beforeAll(async () => {

    const clientIndexes = Array.from({ length: TEST_CLIENT_RENDERERS}, (_, i) => i)
    for (const clientIndex of clientIndexes) {

        const client = await createFileRenderApp({
            host: HOST,
            auth: {
                email: uploader.email,
                password: PASSWORD,
                strategy: `local`
            }
        })

        await client.start()

        clients[clientIndex] = client
    }
})

// upload test files
let uploadedFiles: SignedFile[]
beforeAll(async () => {
    uploadedFiles = await upload.assets(uploader._id)
        .then(data => data.map(datum => datum.signedFile))

    await render.untilAllRenderAgentsIdle()
})

afterAll(() => server.teardown())

/*** Helpers ***/

const getUploadedFileRenderResults = (
    file: File
): RenderAgentData['files'][number]['results'] | null => {

    const matchesUploadedFileId = (f: { _id: string }): boolean =>
        f._id === file._id

    const lastUpdate = renderEvents.updated
        .map(agent => [...agent.files].reverse())
        .find(files => files.some(matchesUploadedFileId))
        ?.find(matchesUploadedFileId)?.results
    
    return lastUpdate ?? null
}

const getFilesAssignedToAgents = (): string[] => {
    const assignedIds = unique(
        renderEvents
            .updated
            .map(agent => agent.files.map(f => f._id))
            .flat()
    )

    return assignedIds
}

/*** Tests ***/

const MEDIA_EXTS = [`.mp4`, `.gif`, `.png`, `.jpg`]
const NON_MEDIA_EXTS = [`.txt`, `.json`]

for (const ext of MEDIA_EXTS) {
    it(`${ext} are assigned to render agents`, () => {
        uploadedFiles
            .filter(f => f.ext === ext)
            .forEach(media => {
                expect(media?._id).not.toBeFalsy()
                expect(getFilesAssignedToAgents()).toContain(media?._id)
            })
    })
}

for (const ext of NON_MEDIA_EXTS) {
    it(`${ext} files are not assigned to render agents`, () => {
        uploadedFiles
            .filter(f => f.ext === ext)
            .forEach(media => {
                expect(media?._id).not.toBeFalsy()
                expect(getFilesAssignedToAgents()).not.toContain(media?._id)
            })
    })
}

for (const ext of MEDIA_EXTS) {
    it(`${ext} files render applicable settings`, async () => {
        for (const file of uploadedFiles.filter(f => f.ext === ext)) {

            const allSettings = Object.keys(server.get(`renderer`)?.settings ?? {})
            const { renders } = await server.service(`files`).get(file._id)

            allSettings.forEach(setting => {
                expect(renders.map(r => r.key)).toContain(setting)
            })
        }
    })
}
