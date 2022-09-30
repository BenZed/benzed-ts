
import { Collection } from 'mongodb'
import { MongoDBApplication, createMongoDBApplication } from './mongo-db-app'

import { isLogger } from '@benzed/util'

let mongoDBApplication: MongoDBApplication
beforeAll(() => {
    mongoDBApplication = createMongoDBApplication()
})

it('creates a mongo application', () => {
    expect(mongoDBApplication).toHaveProperty('log')
    expect(mongoDBApplication).toHaveProperty('db')
    expect(mongoDBApplication).toHaveProperty('start')
})

describe('db() method', () => {
    it('returns a collection instance', async () => {
        await mongoDBApplication.start()

        expect(await mongoDBApplication.db('users'))
            .toBeInstanceOf(Collection)

        await mongoDBApplication.teardown()
    })
})

describe('log() method', () => {
    it('is an instance of @benzed/util Logger', () => {
        expect(isLogger(mongoDBApplication.log))
            .toBe(true)
    })
})

describe('mode()', () => {
    it('returns the current env', () => {
        expect(mongoDBApplication.mode())
            .toEqual('test')
    })
})