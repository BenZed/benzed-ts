import $ from '@benzed/schema'
import { io } from '@benzed/util'

import { Auth } from './auth'
import { App } from '../../app'
import { Service } from '../../service'
import { MongoDb, Record } from '../mongo-db'
import { hashPassword } from './hooks'

import { 
    it, 
    expect, 
    describe, 
    beforeAll, 
    afterAll 
} from '@jest/globals'

//// Tests ////

it('is sealed', () => {
    // @ts-expect-error Sealed
    void class extends Auth {}
})

it('static .create()', () => {

    const auth = Auth.create({})
    expect(auth).toBeInstanceOf(Auth)
})

it('creates access tokens', async () => {

    const auth = Auth.create({})

    const token = await auth.createAccessToken({ foo: 'bar' })

    expect(typeof token).toEqual('string')
    expect(token.length).toBeGreaterThan(0)
})

it('verifies access tokens', async () => {

    const auth = Auth.create({})

    const payload = { foo: 'Cake' }

    const token = await auth.createAccessToken(payload)

    const obj = await auth.verifyAccessToken(token)
    expect(obj).toEqual(payload)
})

it('optional verfication validator', async () => {

    const auth = Auth.create({})

    const payloadIn1 = { email: 'name@email.com', password: 'password' }
    const payloadSchema = $({
        email: $.string.format('email'),
        password: $.string.length('>=', 8)
    })
    const token1 = await auth.createAccessToken(payloadIn1)

    const payloadOut1 = await auth.verifyAccessToken(token1, payloadSchema)
    expect(payloadOut1).toEqual(payloadIn1)

    // 
    const token2 = await auth.createAccessToken({ badPayload: true })
    const token2Error = await auth.verifyAccessToken(token2, payloadSchema.assert).catch(io)

    expect(token2Error).toHaveProperty('name', 'ValidationError')
})

describe('Authentication', () => {

    interface User {
        email: string
        password: string
    }

    const mongoDb = MongoDb.create({ 
        database: 'test-1' 
    }).addCollection<'users', User>(
        'users', 
        $({
            email: $.string,
            password: $.string
        })
    )

    const [ get, find, create, update, remove ] = mongoDb.createRecordCommands('users')

    const userService = Service
        .create()
        .useModules(
            get,
            find,
            create.usePreHook(hashPassword()),
            update.usePreHook(hashPassword()),
            remove
        )

    const app = App
        .create()
        .useModule(mongoDb)
        .useModule(Auth.create())
        .useService('/users', userService)

    const CREDS = {
        email: 'user@email.com',
        password: 'password'
    }

    beforeAll(() => app.start())
    beforeAll(() => app.getModule(MongoDb, true).clearAllCollections())

    let user: Record<User>
    beforeAll(async () => {
        user = await app.execute('usersCreate', CREDS)
    })

    afterAll(() => app.getModule(MongoDb, true).clearAllCollections())
    afterAll(() => app.stop())

    it('authenticate with email/pass', async () => {
        const auth = app.getModule(Auth, true)

        const result = await auth.execute(CREDS)
        const { accessToken } = result ?? {}

        expect(typeof accessToken).toBe('string')
    })

    it('hashes passwords', () => {
        expect(user.password).not.toEqual(CREDS.password)
        expect(user.password.length).toBeGreaterThan(CREDS.password.length)
    })

})