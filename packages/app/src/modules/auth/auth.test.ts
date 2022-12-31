import $ from '@benzed/schema'
import { through } from '@benzed/util'

import { Auth } from './auth'
import { MongoDb, Record } from '../mongo-db'

import { 
    it, 
    expect, 
    describe, 
    beforeAll, 
    afterAll 
} from '@jest/globals'

import { HttpCode } from '../../util'

import { Node } from '@benzed/ecs'

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
    const token2Error = await auth.verifyAccessToken(token2, payloadSchema.assert).catch(through)
    expect(token2Error).toHaveProperty('name', 'ValidationError')
})

describe('Authentication', () => {

    interface User {
        email: string
        password: string
    }

    const mongoDb = MongoDb
        .create({ 
            database: 'test-1' 
        }).addCollection<'users', User>(
        'users', 
        $({
            email: $.string,
            password: $.string
        })
    )

    const userService = Node.from(
        /** get collection commands **/
    )

    const app = Node
        .from(
            mongoDb,
            Auth.create()
        )
        .set('/users', userService)

    const CREDS = {
        email: 'user@email.com',
        password: 'password'
    }

    beforeAll(() => app.start())
    beforeAll(() => app
        .assert(MongoDb)
        .clearAllCollections()
    )

    let user: Record<User>
    beforeAll(async () => {
        user = await app.commands.usersCreate(CREDS)
    })

    afterAll(() => app
        .assert(MongoDb)
        .clearAllCollections()
    )
    afterAll(() => app.stop())

    it('authenticate with email/pass', async () => {
        const auth = app.assert(Auth)
        const result = await auth.execute(CREDS)
        const { accessToken } = result ?? {}

        expect(typeof accessToken).toBe('string')
    })

    it('throws on invalid credentials', async () => {
        const auth = app.assert(Auth)
        const result = await auth.execute({ 
            email: 'hacker@email.com', 
            password: 'not-today-you-scallywag'
        }).catch(through)

        expect(result).toHaveProperty('code', HttpCode.Unauthorized)
        expect(result).toHaveProperty('message', 'Invalid credentials.')
        
    })

    it('hashes passwords', () => {
        expect(user.password).not.toEqual(CREDS.password)
        expect(user.password.length).toBeGreaterThan(CREDS.password.length)
    })

})