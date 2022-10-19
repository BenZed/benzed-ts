import path from 'path'

import fs from '@benzed/fs'

import { User } from '../users'

import { PART_DIR_NAME } from './constants'

import createFileServerApp from '../../create-file-server-app'

import { UploadedAssetData, Uploader, TEST_FILE_SERVER_CONFIG } from '../../../util.test'

/*** Eslint ***/

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Server ***/

const server = createFileServerApp({
    ...TEST_FILE_SERVER_CONFIG,
    renderer: null
})

const users = server.service('users')

const upload = new Uploader(server)

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

let uploadData: UploadedAssetData[] 
beforeAll(async () => {
    uploadData = await upload.assets(uploader._id)
})

/*** Tests ***/

describe('upload', () => {

    for (const testAssetUrl of Object.values(Uploader.ASSETS)) {
        describe(`${path.basename(testAssetUrl)} test upload`, () => {

            const dir = server.get('fs') as string

            let uploadDatum: typeof uploadData[number]
            let fsFilePath: string
            beforeAll(() => {
                
                uploadDatum = uploadData.find(datum => 
                    datum.localFilePath === testAssetUrl
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
        const { large } = Uploader.ASSETS

        const largeFile = await upload.createSignedFile(large, uploader._id)
        const etags = await upload.parts(large, largeFile)
        return expect(upload.parts(large, largeFile)).resolves.toEqual(etags)
    })

    it('uploads cannot be completed more than once', async () => {

        const { mp4 } = Uploader.ASSETS

        const movie = await upload.createSignedFile(mp4, uploader._id)
        const etags = await upload.parts(mp4, movie)
                
        await upload.complete(movie.urls.complete, etags)

        const err = await upload.complete(movie.urls.complete, etags).catch(e => e)
        expect(err.name).toBe('BadRequest')
        expect(err.message).toContain('File upload is already complete')
    })

    it('parts cannot be uploaded once file is completed', async () => {

        const { gif } = Uploader.ASSETS

        const animation = await upload.createSignedFile(gif, uploader._id)
        const etags = await upload.parts(gif, animation)
        await upload.complete(animation.urls.complete, etags)

        const err = await upload.parts(gif, animation).catch(e => e)
        expect(err.name).toBe('BadRequest')
        expect(err.message).toContain('File upload is already complete')
    })

    it('file cannot be completed until all parts are accounted for', async () => {
        
        const { large } = Uploader.ASSETS

        const data = await upload.createSignedFile(large, uploader._id)
        const etag = await upload.part(data.urls.uploadParts[0], large, data.size, 0)

        const err = await upload.complete(data.urls.complete, [etag]).catch(e => e)
        expect(err.name).toBe('BadRequest')
        expect(err.message).toContain('Upload incomplete for id')
    })

    it('handles malformed payloads', async () => {

        const err = await upload.part(
            '/files?upload=notasignedurl',
            Uploader.ASSETS.gif, 
            fs.sync.stat(Uploader.ASSETS.gif).size, 
            0
        ).catch(e => e)

        expect(err.code).toEqual(400)
        expect(err.name).toEqual('BadRequest')
    })

})
