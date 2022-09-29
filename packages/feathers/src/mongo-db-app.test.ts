
import { Collection } from 'mongodb'
import { MongoDBApplication, createMongoDBApplication } from './mongo-db-app'

import { isLogger } from '@benzed/util'

let mongoApplication: MongoDBApplication

beforeAll(() => {
    mongoApplication = createMongoDBApplication()
})

it('creates a mongo application', () => {
    expect(mongoApplication).toHaveProperty('log')
    expect(mongoApplication).toHaveProperty('db')
    expect(mongoApplication).toHaveProperty('start')
})

describe('db() method', () => {
    it('returns a collection instance', async () => {
        await mongoApplication.start()
        expect(await mongoApplication.db('users')).toBeInstanceOf(Collection)
        await mongoApplication.teardown()
    })
})

describe('log() method', () => {
    it('is an instance of @benzed/util Logger', () => {
        expect(isLogger(mongoApplication.log)).toBe(true)
    })
})

describe('mode()', () => {
    it('returns the current env', () => {
        expect(mongoApplication.mode()).toEqual('test')
    })
})