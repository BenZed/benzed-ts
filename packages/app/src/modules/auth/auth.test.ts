import $ from '@benzed/schema'
import { io } from '@benzed/util'

import { App } from '../../app'
import { MongoDb } from '../mongo-db'
import { Auth } from './auth'

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

    //
    const payloadOut1 = await auth.verifyAccessToken(token1, payloadSchema)
    expect(payloadOut1).toEqual(payloadIn1)

    // 
    const token2 = await auth.createAccessToken({ badPayload: true })
    const token2Error = await auth.verifyAccessToken(token2, payloadSchema.assert).catch(io)

    expect(token2Error).toHaveProperty('name', 'ValidationError')
})

describe('Authentication', () => {

    const mongoDb = MongoDb.create({ 
        database: 'test-1' 
    }).addCollection(
        'users', 
        $({
            email: $.string,
            password: $.string
        })
    )

    const app = App
        .create()
        .useModule(
            mongoDb
        )
        .useModule(
            Auth.create()
        )

    const CREDS = {
        email: 'user@email.com',
        password: 'password'
    }

    beforeAll(() => app.start())

    beforeAll(async () => {

        const database = app.getModule(MongoDb, true) as typeof mongoDb
        const users = database.getCollection('users')

        await users.create(CREDS)
    })

    afterAll(() => app.stop())

    it('authenticate with email/pass', async () => {

        const auth = app.getModule(Auth, true)
        const result = await auth.execute(CREDS)
        const { accessToken } = result ?? {}

        expect(typeof accessToken).toBe('string')

    })

})