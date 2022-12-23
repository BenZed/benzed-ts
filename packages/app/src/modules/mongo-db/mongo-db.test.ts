import $ from '@benzed/schema'
import { Empty } from '@benzed/util'
import { Node } from '@benzed/ecs'

import { MongoDb } from './mongo-db'
import MongoDbCollection from './mongo-db-collection'

import { expectTypeOf } from 'expect-type'

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

describe('module validation', () => {
    it('must be single', () => {
        expect(() => {
            Node.from(
                MongoDb.create({ database: 'test' }),
                MongoDb.create({ database: 'test' })
            )
        }).toThrow('cannot be placed with other MongoDb modules')
    })
})

