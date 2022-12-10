import $ from '@benzed/schema'
import { Empty, through } from '@benzed/util'

import { Service } from '../../service'

import { MongoDb } from './mongo-db'
import MongoDbCollection, { Record } from './mongo-db-collection'

import { expectTypeOf } from 'expect-type'
import { Server } from '../connection'

//// Setup ////

const mongoDbEmpty = MongoDb
    .create({ 
        database: 'test'
    })

const mongoDb = mongoDbEmpty
    .addCollection(
        'score', 
        $({
            count: $.number
        })
    )
    .addCollection(
        'cake',
        $({
            slices: $.number
        })
    )

beforeAll(() => mongoDb.start())

afterAll(() => mongoDb.stop())

//// Tests ////

it('is sealed', () => {
    // @ts-expect-error Sealed
    void class extends MongoDb<Empty> {}
})

it('create()', () => {
    expect(mongoDb).toBeInstanceOf(MongoDb)
})

describe('.addCollection()', () => {

    it('adds a collection', () => {
        expect(Object.keys(mongoDb.collections))
            .toEqual(['score', 'cake'])
    })

    it('immutable', () => {
        expect(mongoDb).not.toBe(mongoDbEmpty)
    })

    it('throws if collection name exists', () => {
        expect(() => mongoDb.addCollection('score', $({})))
            .toThrow('Collection \'score\' already exists.')
    })

    it('name must not be empty', () => {
        expect(() => mongoDb.addCollection('', $({})))
            .toThrow('Collection name must not be empty.')
    })
})

describe('.getCollection()', () => {

    it('returns a collection', () => {
        const score = mongoDb
            .getCollection('score')

        expect(score)
            .toBeInstanceOf(MongoDbCollection)
    })

    it('typesafe', () => {
        const score = mongoDb
            .getCollection('score')
        
        expectTypeOf(score)
            .toEqualTypeOf<MongoDbCollection<{ readonly count: number }>>()
    })

    it('throws if collection does not exist', () => {
        // @ts-expect-error ace is not a collection name
        expect(() => mongoDb.getCollection('ace'))
            .toThrow('Collection \'ace\' does not exist.')
    })

})

describe('createCommands()', () => {

    const [ getCake, findCake, createCake, updateCake, removeCake ] = mongoDb.createRecordCommands('cake')

    const cakeService = Service.create()
        .useModules(
            mongoDb,
            getCake,
            findCake,
            createCake,
            updateCake,
            removeCake 
        )

    const cakeApp = cakeService.useModule(Server.create({}))

    let smallCake: Record<{ readonly slices: number }>
    let bigCake: Record<{ readonly slices: number }>
    let rmCake: Record<{ readonly slices: number }>
    
    beforeAll(() => cakeApp.start())
    beforeAll(() => cakeApp.findModule(MongoDb, true).clearAllCollections())
    beforeAll(async () => {
        smallCake = await cakeApp.commands.create({ slices: 3 })
        rmCake = await cakeApp.commands.create({ slices: 4 })
        bigCake = await cakeApp.commands.create({ slices: 5 })

        await cakeApp.commands.remove({ id: rmCake._id })
    })
    afterAll(() => cakeApp.stop())

    it('creates a series of commands for each collection method of a collection', () => {
        expect(cakeService.modules).toHaveLength(6)
    })

    it('create() record in database', () => {
        expect(smallCake).toEqual({ slices: 3, _id: expect.any(String) })
        expect(bigCake).toEqual({ slices: 5, _id: expect.any(String) })
    }) 

    it('get() record from database', async () => {
        const record = await cakeApp.commands.get({ id: smallCake._id })
        expect(record).toEqual(smallCake)
    })
    
    it('find() record from database', async () => {
        const { records, total } = await cakeApp.commands.find({})
        expect(records).toEqual([smallCake, bigCake])
        expect(total).toEqual(2)
    })

    it('remove() record from database', async () => {
        const err = await cakeApp.commands.get({ id: rmCake._id }).catch(through)
        expect(err).toHaveProperty('message', expect.stringContaining('could not be found'))
    })
})

describe('module validation', () => {
    it('must be single', () => {
        expect(() => {
            Service.create()
                .useModule(MongoDb.create({ database: 'test' }))
                .useModule(MongoDb.create({ database: 'test' }))
        }).toThrow('may only be used once')
    })
})

