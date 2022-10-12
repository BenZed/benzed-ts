import path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
import fetch from 'node-fetch'

import configuration from '@feathersjs/configuration'

import fs from '@benzed/fs'
import { min } from '@benzed/array'
import { TEST_ASSETS } from '@benzed/renderer/test-assets'

import { User } from '../users'
import { SignedFile } from './service'

import { 
    MAX_UPLOAD_PART_SIZE, 
    PART_DIR_NAME 
} from './constants'

import createFileServerApp, { FileServerConfig } from '../../create-file-server-app'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Server ***/

const server = createFileServerApp({
    ...configuration()() as unknown as FileServerConfig,
    renderer: null
})

const files = server.service('files')
const users = server.service('users')

const HOST = `http://localhost:${server.get('port')}` 

const UPLOAD_TEST_ASSETS = {
    ...TEST_ASSETS,
    large: path.resolve(
        server.get('fs') as string, 
        '../large-binary-list.json'
    )
}

beforeAll(() => server.start())

afterAll(() => server.teardown())

let uploader: User
beforeAll(async () => {
    uploader = await users.create({
        name: 'Test User',
        email: 'test@user.com',
        password: 'password'
    })
})

/**
 * Create a file larger than the max upload part size to ensure part 
 */
beforeAll(async () => {

    const { large } = UPLOAD_TEST_ASSETS

    const binaryList: { index: number, binary: string }[] = []

    let i = 0
    let size = 0
    while (size < MAX_UPLOAD_PART_SIZE * 3) {
        const binaryListItem = { 
            index: i++, 
            binary: i.toString(2) 
        }
        binaryList.push(binaryListItem)
        size += JSON.stringify(binaryListItem, null, 4).length + 16 //
    }

    await fs.appendFile(
        large,
        JSON.stringify(
            binaryList,
            null, 
            4
        )
    )
})

/*** File Uploading ***/

const createSignedFile = (
    localFileUrl: string
): Promise<SignedFile> => {

    const stat = fs.sync.stat(localFileUrl)

    return files.create({
        size: stat.size,
        name: path.basename(localFileUrl),
        uploader: uploader._id
    })
}

const uploadPart = async (
    partUrl: string, 
    sourceFileUrl: string,
    sourceFileSize: number, 
    partIndex: number
): Promise<string> => {

    const res = await fetch(
        HOST + partUrl,
        {
            method: 'PUT',
            body: fs.createReadStream(sourceFileUrl, { 
                start: partIndex * MAX_UPLOAD_PART_SIZE,
                end: min((partIndex + 1) * MAX_UPLOAD_PART_SIZE, sourceFileSize)
            })
        }
    )

    const json = await res.json()
    if (res.status >= 400)
        throw json

    return res.headers.get('etag') as string
}

const uploadComplete = async (
    completeUrl: string,
    etags: string[]
): Promise<{ code: number }> => {

    const res = await fetch(
        HOST + completeUrl,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: etags
        }
    )

    const json = await res.json()
    if (res.status >= 400)
        throw json

    return json
}

const uploadParts = async (
    localFileUrl: string,
    { urls, size }: SignedFile
): Promise<string[]> => {

    const etags: string[] = []

    for (let i = 0; i < urls.uploadParts.length; i++) {
        const partUrl = urls.uploadParts[i]
        etags.push(
            await uploadPart(partUrl, localFileUrl, size, i)
        ) 
    }

    return etags
}

const uploadData: { 
    partEtags: string[]
    signedFile: SignedFile
    sourceFileUrl: string
    partNames: string[]
}[] = []

beforeAll(async () => {

    for (const sourceFileUrl of Object.values(UPLOAD_TEST_ASSETS)) {

        const signedFile = await createSignedFile(sourceFileUrl)
        const partEtags = await uploadParts(sourceFileUrl, signedFile).catch(e => e)

        const partNames = fs.sync.readDir(
            path.join(
                server.get('fs') as string, 
                signedFile._id, 
                PART_DIR_NAME
            )
        )

        await uploadComplete(signedFile.urls.complete, partEtags)

        uploadData.push({ 
            signedFile, 
            sourceFileUrl,
            partEtags, 
            partNames 
        })
    }
})

/*** Tests ***/

describe('upload', () => {

    for (const testAssetUrl of Object.values(UPLOAD_TEST_ASSETS)) {
        describe(`${path.basename(testAssetUrl)} test upload`, () => {

            const dir = server.get('fs') as string

            let uploadDatum: typeof uploadData[number]
            let fsFilePath: string
            beforeAll(() => {
                
                uploadDatum = uploadData.find(o => 
                    o.sourceFileUrl === testAssetUrl
                ) as typeof uploadData[number]
                
                fsFilePath = path.join(
                    dir,
                    uploadDatum.signedFile._id,
                    uploadDatum.signedFile.name + uploadDatum.signedFile.ext
                )
            })

            it('part upload responds with etags', () => {
                expect(uploadDatum.partEtags).not.toHaveLength(0)
            })

            it('creates file parts on the server', () => {
                expect(uploadDatum.partNames).not.toHaveLength(0)
                expect(uploadDatum.partNames.every(p => p.includes(uploadDatum.signedFile._id)))
            })

            it('completing downloads merges them into a single file', async () => {
                const stat = await fs.stat(fsFilePath)

                // within 100 bytes
                expect(stat.size / 100).toBeCloseTo(uploadDatum.signedFile.size / 100, 1)
            })

            it('completing downloads removes the file\'s part folder', () => {
                expect(
                    !fs.sync.exists(
                        path.join(
                            path.dirname(fsFilePath), 
                            PART_DIR_NAME
                        )
                    )
                )
            })

            it('completing download fills file uploaded date', async () => {
                const file = await server.service('files').get(uploadDatum.signedFile._id)
                expect(file.uploaded).toBeInstanceOf(Date)
            })

        })
    }

    it('part uploads are idempotent', async () => {
        const { large } = UPLOAD_TEST_ASSETS
        const largeFile = await createSignedFile(large)
        const etags = await uploadParts(large, largeFile)
        return expect(uploadParts(large, largeFile)).resolves.toEqual(etags)
    })

    it('uploads cannot be completed more than once', async () => {

        const { mp4 } = UPLOAD_TEST_ASSETS

        const movie = await createSignedFile(mp4)
        const etags = await uploadParts(mp4, movie)
                
        await uploadComplete(movie.urls.complete, etags)

        const err = await uploadComplete(movie.urls.complete, etags).catch(e => e)
        expect(err.name).toBe('BadRequest')
        expect(err.message).toContain('File upload is already complete')
    })

    it('parts cannot be uploaded once file is completed', async () => {

        const { gif } = UPLOAD_TEST_ASSETS

        const animation = await createSignedFile(gif)
        const etags = await uploadParts(gif, animation)
        await uploadComplete(animation.urls.complete, etags)

        const err = await uploadParts(gif, animation).catch(e => e)
        expect(err.name).toBe('BadRequest')
        expect(err.message).toContain('File upload is already complete')
    })

    it('file cannot be completed until all parts are accounted for', async () => {
        const { large } = UPLOAD_TEST_ASSETS
        const data = await createSignedFile(large)
        const etag = await uploadPart(data.urls.uploadParts[0], large, data.size, 0)

        const err = await uploadComplete(data.urls.complete, [etag]).catch(e => e)
        expect(err.name).toBe('BadRequest')
        expect(err.message).toContain('Upload incomplete for id')
    })

    it('handles malformed payloads', async () => {

        const err = await uploadPart(
            '/files?upload=notasignedurl',
            UPLOAD_TEST_ASSETS.gif, 
            fs.sync.stat(UPLOAD_TEST_ASSETS.gif).size, 
            0
        ).catch(e => e)

        expect(err.code).toEqual(400)
        expect(err.name).toEqual('BadRequest')

    })

})
