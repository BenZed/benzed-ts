import path from 'path'
import mime from 'mime'
import { ObjectId } from 'mongodb'

import createFileServerApp from '../server/create-file-server-app'
import { $file, FileData } from './schema'

import { BadRequest } from '@feathersjs/errors'

import { User } from '../server/services/users'
import { SignedFile } from './service'
import { MAX_UPLOAD_PART_SIZE } from './constants'

/* eslint-disable @typescript-eslint/no-explicit-any */ 

/*** File Service Tests ***/

const server = createFileServerApp()
const files = server.service(`files`)
const users = server.service(`users`)

beforeAll(() => server.start())
afterAll(() => server.teardown())

let uploader: User
beforeAll(async () => {
    uploader = await users.create({
        name: `Test User`,
        email: `test@user.com`,
        password: `password`
    })
})

it(`is registered`, () => {
    expect(files).toBeDefined()
})

it(`uses pagination`, async () => {
    const found = await files.find({})

    expect(found).toHaveProperty(`total`)
    expect(found).toHaveProperty(`skip`)
    expect(found).toHaveProperty(`limit`)
})

describe(`create`, () => {

    const fileName = `manifest.mov`

    const now = new Date()

    let file: SignedFile
    beforeAll(async () => {
        file = await files.create({ 
            name: fileName, 
            uploader: uploader._id,
            size: 1024 * 1024 * 22, // 20 mb
        })
    })

    it(`does not return an array`, () => {
        expect(file).not.toBeInstanceOf(Array)
    })

    it(`creates valid files`, () => {

        try {
            void $file.assert(file)
        } catch (e) {
            console.error(e)
        }
            
        expect(() => $file.assert(file)).not.toThrow()

    })

    describe(`validation`, () => {

        it(`removes extension from name`, () => {
            expect(file.name)
                .not
                .toContain(file.ext)
        })

        it(`fills timestamps`, () => {

            expect(file.created > now)
                .toBe(true)

            expect(file.updated > now)
                .toBe(true)
        })

        it(`fills mime-type`, () => {
            expect(file.type)
                .toBe(mime.getType(fileName))
        })

        it(`fills extension`, () => {
            expect(file.ext)
                .toBe(path.extname(fileName))
        })

        it(`requires file extension in name`, async () => {
                
            const err = await files.create({
                name: `Peach`
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.message).toContain(`name must have file extension`)
        })

        it(`requires file size`, async () => {
            const err = await files.create({
                name: `data.json`
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.message).toContain(`size is required`)
        })

        it(`uploader id required`, async () => {
            const err = await files.create({
                name: `data.json`,
                size: 1000
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.data.uploader)
                .toHaveProperty(`message`, `id for users service required`)
        })

        it(`uploader id must point to an existing user`, async () => {

            const badId = new ObjectId().toString()

            const err = await files.create({
                name: `data.json`,
                size: 1000,
                uploader: badId
            }).catch(e => e)

            expect(err).toBeInstanceOf(Error)
            expect(err.name).toBe(BadRequest.name)
            expect(err.data.uploader)
                .toHaveProperty(`message`, `No record found for id '${badId}'`)
        })

        it(`uploader is automatically inferred from authenticated user`, async () => {

            const fakeId = new ObjectId().toString()

            const file = await files.create({
                uploader: fakeId,
                name: `data.json`,
                size: 1000,
            }, { 
                user: uploader
            })

            expect(file.uploader).toEqual(uploader._id)
        })

        it(`ignores fields other than "name", "uploader" and "size"`, async () => {

            const data: FileData = {
                name: `a-long-file-name.mp4`,
                ext: `.notmp4`,
                type: `application/json`,

                size: 1000,
                uploader: uploader._id,
                renders: [{ key: `not-real`, size: -10, rendered: new Date(0) }],
    
                created: new Date(0),
                updated: new Date(0),
                uploaded: new Date(0)
            }

            const file = await files.create(data)

            const { name, uploader: uploaderId, size , ...rest } = file 

            expect(name).toEqual(data.name.replace(/\.([a-z]|\d)+$/, ``))
            expect(uploaderId).toEqual(data.uploader)
            expect(size).toEqual(data.size)

            for (const key in rest)
                expect((rest as any)[key]).not.toEqual((data as any)[key])
        })
    })

    describe(`signed urls`, () => {

        it(`result data includes signed urls`, () => {
            expect(file.urls.local).toBe(true)
            expect(file.urls.uploadParts).toBeInstanceOf(Array)
            expect(typeof file.urls.complete).toBe(`string`)
        })

        it(`one file part for each 10mb chunk`, () => {
            expect(file.urls.uploadParts)
                .toHaveLength(Math.ceil(file.size / MAX_UPLOAD_PART_SIZE))
        })
    })
})