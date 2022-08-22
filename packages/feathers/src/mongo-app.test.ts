
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

it('creates a mongo application', () => {
    expect(mongoApplication).toHaveProperty('log')
    expect(mongoApplication).toHaveProperty('db')
    expect(mongoApplication).toHaveProperty('start')
})

describe('db() method', () => {
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

describe('mode()', () => {
    it('returns the current env', () => {
        expect(mongoApplication.mode()).toEqual('test')
    })
})

describe('isMode()', () => {
    it('if provided with a mode, returns true if current env is that mode, false otherwise', () => {
        expect(mongoApplication.isMode('test')).toBe(true)
    })
})

describe('default providers', () => {

    it('socketio', () => {
        expect(mongoApplication.io).toBeTruthy()
    })

    it.todo('rest')
})

describe('default middleware', () => {

    it.todo('helmet')
    it.todo('compress')
    it.todo('json')
    it.todo('urlencoded')
    it.todo('rest')

})