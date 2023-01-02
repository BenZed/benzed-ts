import $ from '@benzed/schema'
import { through } from '@benzed/util'

import { Service } from '../../service'
import { App } from '../../app'

import { Authentication } from './authentication'
import { MongoDb, Record } from '../mongo-db'

import {
    it,
    expect,
    describe,
    beforeAll,
    afterAll
} from '@jest/globals'

import { HttpCode } from '../../util'

//// Tests ////

it('static .create()', () => {
    const auth = Authentication.create({})
    expect(auth).toBeInstanceOf(Authentication)
})

it('creates access tokens', async () => {

    const auth = Authentication.create({})

    const token = await auth.createAccessToken({ foo: 'bar' })

    expect(typeof token).toEqual('string')
    expect(token.length).toBeGreaterThan(0)
})

it('verifies access tokens', async () => {

    const auth = Authentication.create({})

    const payload = { foo: 'Cake' }
    const token = await auth.createAccessToken(payload)

    const obj = await auth.verifyAccessToken(token)
    expect(obj).toEqual(payload)
})

it('optional verfication validator', async () => {

    const auth = Authentication.create({})

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

    //// App Modules ////

    const mongodb = MongoDb.create({ 
        database: 'test-1' 
    })

    const authentication = Authentication.create()

    const users = mongodb.createCollection('users', {
        email: $.string,
        password: $.string
    })

    //// App ////

    const app = App.create({

        users: Service.create(users.createCommands()),

        auth: Service.create(
            {
                login: authentication.createCommand()
            },
            authentication
        ),

        database: Service.create(
            mongodb,
            users
        )
    })  

    const CREDS = {
        email: 'user@email.com',
        password: 'password'
    }

    beforeAll(() => app.start())
    beforeAll(() => app
        .module(MongoDb)
        .clearAllCollections()
    )

    let user: Record<User>
    beforeAll(async () => {
        user = await app.commands.users.create(CREDS, {})
    })

    afterAll(() => app
        .module(MongoDb)
        .clearAllCollections()
    )
    afterAll(() => app.stop())

    it('authenticate with email/pass', async () => {
        const result = await app.commands.auth.login(CREDS, {})
        const { accessToken } = result ?? {}

        expect(typeof accessToken).toBe('string')
    })

    it('throws on invalid credentials', async () => {
        const result = await app.commands.auth.login({  
            email: 'hacker@email.com', 
            password: 'not-today-you-scallywag'
        }, {}).catch(through)

        expect(result).toHaveProperty('code', HttpCode.Unauthorized)
        expect(result).toHaveProperty('message', 'Invalid credentials.')
        
    })

    it('hashes passwords', () => {
        expect(user.password).not.toEqual(CREDS.password)
        expect(user.password.length).toBeGreaterThan(CREDS.password.length)
    })

})