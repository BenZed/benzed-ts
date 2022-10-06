import mime from 'mime'
import path from 'path'
import createFileServerApp from '../create-file-server-app'
import { $file, File } from '../schemas'

import { BadRequest } from '@feathersjs/errors'
import { User } from './users'
import { ObjectID } from 'bson'

/*** File Service Tests ***/

describe('File Service', () => {

    const fileServer = createFileServerApp()
    const files = fileServer.service('files')
    const users = fileServer.service('users')
    
    beforeAll(() => fileServer.start())

    let uploader: User
    beforeAll(async () => {
        uploader = await users.create({
            name: 'Test User',
            email: 'test@user.com',
            password: 'password'
        })
    })

    afterAll(() => fileServer.teardown())

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

        const fileName = 'manifest.txt'

        const now = new Date()

        let file: File
        beforeAll(async () => {
            file = await files.create({ 
                name: fileName, 
                uploader: uploader._id, 
                size: 100,
            })
        })

        it('creates valid files', () => {
            expect(() => $file.validate(file))
                .not
                .toThrow()
        })

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

            const badId = new ObjectID().toString()

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
            }, { user: uploader })

            expect(file.uploader).toEqual(uploader._id)
        })
    })
})