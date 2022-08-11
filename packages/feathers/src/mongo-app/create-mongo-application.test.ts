import { Db } from 'mongodb'
import { MongoApplication, createMongoApplication } from './create-mongo-application'

describe('createMongoApplication method', () => {

    let mongoApp: MongoApplication
    beforeAll(() => {
        mongoApp = createMongoApplication({})
    })

    it('creates a gears application', () => {
        expect(mongoApp).toHaveProperty('log')
        expect(mongoApp).toHaveProperty('db')
        expect(mongoApp).toHaveProperty('start')
    })

    describe('db() method', () => {
        it('throws if mongodb is not connected ', () => {
            expect(mongoApp.db).toThrow('is not yet connected')
        })
        it('returns a mongodb instance if connected', async () => {
            await mongoApp.start()
            expect(mongoApp.db()).toBeInstanceOf(Db)
            await mongoApp.teardown()
        })
    })

    describe('log() method', () => {
        it('is an instance of @benzed/util Logger', () => {
            expect(mongoApp.log).toBeInstanceOf(Function)
            expect(mongoApp.log.info).toBeInstanceOf(Function)
            expect(mongoApp.log.warn).toBeInstanceOf(Function)
            expect(mongoApp.log.error).toBeInstanceOf(Function)
        })
    })
})