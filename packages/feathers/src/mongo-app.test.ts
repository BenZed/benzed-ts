import { Db } from 'mongodb'
import { MongoApplication, createMongoApplication } from './mongo-app'

import { isLogger } from '@benzed/util'

let mongoApplication: MongoApplication

beforeAll(() => {
    mongoApplication = createMongoApplication({
        services() {
            //
        },
        middleware() {
            //
        }
    })
})

it('creates a gears application', () => {
    expect(mongoApplication).toHaveProperty('log')
    expect(mongoApplication).toHaveProperty('db')
    expect(mongoApplication).toHaveProperty('start')
})

describe.skip('db() method', () => {
    it('throws if mongodb is not connected ', () => {
        expect(mongoApplication.db).toThrow('is not yet connected')
    })
    it('returns a mongodb instance if connected', async () => {
        await mongoApplication.start()
        expect(mongoApplication.db()).toBeInstanceOf(Db)
        await mongoApplication.teardown()
    })
})

describe('log() method', () => {
    it('is an instance of @benzed/util Logger', () => {
        expect(isLogger(mongoApplication.log)).toBe(true)
    })
})