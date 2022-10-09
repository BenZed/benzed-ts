import fs from '@benzed/fs'
import path from 'path'
import mime from 'mime'
import { ObjectId } from 'mongodb'

import createFileServerApp from '../create-file-server-app'
import { $file, FileData } from '../schemas'

import { BadRequest } from '@feathersjs/errors'

import { User } from './users'
import { SignedFile } from './files/service'
import { MAX_UPLOAD_PART_SIZE, PART_DIR_NAME } from './files/constants'

import { TEST_ASSETS } from '../../../../renderer/test-assets'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
import fetch from 'node-fetch'
import { min } from '@benzed/array'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

/*** File Service Tests ***/

const server = createFileServerApp()
const files = server.service('files')
const users = server.service('users')

const UPLOAD_TEST_ASSETS = {
    ...TEST_ASSETS,
    large: path.resolve(server.get('fs') as string, '../large-binary-list.json')
}

beforeAll(() => server.start())

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

afterAll(() => server.teardown())

it('is registered', () => {
    expect(files).toBeDefined()
})

it('uses pagination', async () => {
    const found = await files.find({})

    expect(found).toHaveProperty('total')
    expect(found).toHaveProperty('skip')
    expect(found).toHaveProperty('limit')
})

describe('create', () => {

    const fileName = 'manifest.mov'

    const now = new Date()

    let file: SignedFile
    beforeAll(async () => {
        file = await files.create({ 
            name: fileName, 
            uploader: uploader._id,
            size: 1024 * 1024 * 22, // 20 mb
        })
    })

    it('does not return an array', () => {
        expect(file).not.toBeInstanceOf(Array)
    })

    it('creates valid files', () => {

        try {
            void $file.assert(file)
        } catch (e) {
            console.error(e)
        }
            
        expect(() => $file.assert(file)).not.toThrow()

    })

    describe('validation', () => {

        it('removes extension from name', () => {
            expect(file.name)
                .not
                .toContain(file.ext)
        })

        it('fills timestamps', () => {

            expect(file.created > now)
                .toBe(true)

            expect(file.updated > now)
                .toBe(true)
        })

        it('fills mime-type', () => {
            expect(file.type)
                .toBe(mime.getType(fileName))
        })

        it('fills extension', () => {
            expect(file.ext)
                .toBe(path.extname(fileName))
        })

        it('requires file extension in name', async () => {
                
            const err = await files.create({
                name: 'Peach'
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.message).toContain('name must have file extension')
        })

        it('requires file size', async () => {
            const err = await files.create({
                name: 'data.json'
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.message).toContain('size is required')
        })

        it('uploader id required', async () => {
            const err = await files.create({
                name: 'data.json',
                size: 1000
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.data.uploader)
                .toHaveProperty('message', 'id for users service required')
        })

        it('uploader id must point to an existing user', async () => {

            const badId = new ObjectId().toString()

            const err = await files.create({
                name: 'data.json',
                size: 1000,
                uploader: badId
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.data.uploader)
                .toHaveProperty('message', `No record found for id '${badId}'`)
        })

        it('uploader is automatically inferred from authenticated user', async () => {

            const fakeId = new ObjectId().toString()

            const file = await files.create({
                uploader: fakeId,
                name: 'data.json',
                size: 1000,
            }, { 
                user: uploader
            })

            expect(file.uploader).toEqual(uploader._id)
        })

        it('ignores fields other than "name", "uploader" and "size"', async () => {

            const data: FileData = {
                name: 'a-long-file-name.mp4',
                ext: '.notmp4',
                type: 'application/json',

                size: 1000,
                uploader: uploader._id,
                renders: [{ key: 'not-real', size: -10, rendered: new Date(0) }],
    
                created: new Date(0),
                updated: new Date(0),
                uploaded: new Date(0)
            }

            const file = await files.create(data)

            const { name, uploader: uploaderId, size , ...rest } = file 

            expect(name).toEqual(data.name.replace(/\.([a-z]|\d)+$/, ''))
            expect(uploaderId).toEqual(data.uploader)
            expect(size).toEqual(data.size)

            for (const key in rest)
                expect((rest as any)[key]).not.toEqual((data as any)[key])
        })
    })

    describe('signed urls', () => {

        it('result data includes signed urls', () => {
            expect(file.urls.local).toBe(true)
            expect(file.urls.uploadParts).toBeInstanceOf(Array)
            expect(typeof file.urls.complete).toBe('string')
        })

        it('one file part for each 10mb chunk', () => {
            expect(file.urls.uploadParts)
                .toHaveLength(Math.ceil(file.size / MAX_UPLOAD_PART_SIZE))
        })

    })
})

describe('upload', () => {

    const HOST = `http://localhost:${server.get('port')}` 

    const createSignedFile = async (
        localFileUrl: string
    ): Promise<SignedFile> => {

        const stat = fs.sync.stat(localFileUrl)

        const file = await files.create({
            size: stat.size,
            name: path.basename(localFileUrl),
            uploader: uploader._id
        })

        return file
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
        if (json.code >= 400)
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
        if (json.code >= 400)
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
            const partEtags = await uploadParts(sourceFileUrl, signedFile)

            const partNames = fs.sync.readDir(
                path.join(
                    server.get('fs') as string, 
                    signedFile._id, 
                    PART_DIR_NAME
                )
            )

            const lil = await uploadComplete(signedFile.urls.complete, partEtags)

            uploadData.push({ 
                signedFile, 
                sourceFileUrl,
                partEtags, 
                partNames 
            })
        }
    })

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
        expect(err.message).toContain('File upload is already complete')

    })

    it('handles malformed payloads', async () => {

        const err = await uploadPart(
            '/files?upload=notasignedurl',
            UPLOAD_TEST_ASSETS.gif, 
            fs.sync.stat(UPLOAD_TEST_ASSETS.gif).size, 
            0
        ).catch(e => e)

        expect(err.code).toEqual(400)
        expect(err.name).toEqual('Bad Request')

    })

})

describe('serving', () => {
        
    it('serves files', async () => {
            
        const file = await files.create({
            size: 1024 * 1024 * 40,
            name: 'New File.mov',
            uploader: uploader._id
        })

        const res = await fetch(
            `http://localhost:${server.get('port')}/files?download=${file._id}`,
            {
                method: 'GET'
            }
        )

        console.log(await res.text())
    })

    it.todo('file cannot be downloaded until it is complete')

})