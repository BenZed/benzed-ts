import fs from '@benzed/fs'
import path from 'path'
import mime from 'mime'
import { ObjectId } from 'mongodb'

import createFileServerApp from '../create-file-server-app'
import { $file, File, FileData } from '../schemas'

import { BadRequest } from '@feathersjs/errors'

import { User } from './users'
import { SignedFile } from './files/service'
import { MAX_UPLOAD_PART_SIZE, PART_DIR_NAME } from './files/constants'

import { TEST_ASSETS } from '../../../../renderer/test-assets'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore 
import fetch from 'node-fetch'
import { min } from '@benzed/array/lib'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

/*** File Service Tests ***/

const server = createFileServerApp()
const files = server.service('files')
const users = server.service('users')
    
beforeAll(() => server.start())

let uploader: User
beforeAll(async () => {
    uploader = await users.create({
        name: 'Test User',
        email: 'test@user.com',
        password: 'password'
    })
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

            const file = await files.create({
                name: 'data.json',
                size: 1000
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

    const uploadPart = (
        partUrl: string, 
        sourceFileUrl: string,
        sourceFileSize: number, 
        partIndex: number
    ): any => fetch(
        `http://localhost:${server.get('port')}` + partUrl,
        {
            method: 'PUT',
            body: fs.createReadStream(sourceFileUrl, { 
                start: partIndex * MAX_UPLOAD_PART_SIZE,
                end: min((partIndex + 1) * MAX_UPLOAD_PART_SIZE, sourceFileSize)
            })
        }
    )

    const uploadParts = async (
        localFileUrl: string,
        { urls, size }: SignedFile
    ): Promise<string[]> => {

        const etags: string[] = []
        for (let i = 0; i < urls.uploadParts.length; i++) {

            const partUrl = urls.uploadParts[i]

            const res = await uploadPart(partUrl, localFileUrl, size, i)

            etags.push(res.headers.get('etag') as string)
        }

        return etags
    }

    const output: { 
        partEtags: string[]
        signedFile: SignedFile
        sourceFileUrl: string
        partNames: string[]
    }[] = []
    beforeAll(async () => {
        for (const sourceFileUrl of Object.values(TEST_ASSETS)) {

            const signedFile = await createSignedFile(sourceFileUrl)

            const partEtags = await uploadParts(sourceFileUrl, signedFile)

            const partNames = fs.sync.readDir(
                path.join(
                    server.get('fs') as string, 
                    signedFile._id, 
                    PART_DIR_NAME
                )
            )

            output.push({ 
                signedFile, 
                sourceFileUrl,
                partEtags, 
                partNames 
            })
        }
    })

    for (const out of output) {
        describe(`${out.signedFile.name} test upload`, () => {

            it('part upload responds with etags', () => {
                expect(out.partEtags).not.toHaveLength(0)
            })

            it('creates file parts on the server', () => {
                expect(out.partNames).not.toHaveLength(0)
                expect(out.partNames.every(p => p.includes(out.signedFile._id)))
            })

            it.todo('marking uploads as complete compiles')

        })
    }

    it('part uploads are idempotent', async () => {

        const { gif } = TEST_ASSETS

        const gifFile = await createSignedFile(gif)

        const etags = await uploadParts(gif, gifFile)

        return expect(uploadParts(gif, gifFile)).resolves.toEqual(etags)
    })

    it.todo('parts cannot be uploaded once file is completed')

    it.todo('file cannot be completed until all parts are accounted for')

    it.only('handles malformed payloads', async () => {

        const res = await uploadPart(
            '/files?upload=notasignedurl',
            TEST_ASSETS.gif, 
            fs.sync.stat(TEST_ASSETS.gif).size, 
            0
        )

        expect(res.status).toEqual(400)
        expect(res.statusText).toEqual('BadRequest')

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

})