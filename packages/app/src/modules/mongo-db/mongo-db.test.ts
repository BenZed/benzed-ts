import { Empty } from '@benzed/util'
import { Node } from '@benzed/ecs'

import { MongoDb } from './mongo-db'

//// Setup ////

const mongoDb = MongoDb.create({ database: 'test' })

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

describe('module validation', () => {
    it('must be single', () => {
        expect(() => {
            Node.create(
                MongoDb.create({ database: 'test' }),
                MongoDb.create({ database: 'test' })
            )
        }).toThrow('cannot be placed with other MongoDb modules')
    })
})

