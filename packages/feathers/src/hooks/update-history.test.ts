import updateHistory from './update-history'

import { milliseconds } from '@benzed/async'
import { Params } from '@feathersjs/feathers'

import { createTestApp } from '../util.test'
import { getInternalServiceMethods } from '../util'

/* eslint-disable @typescript-eslint/no-explicit-any */

type User = {
    _id: string
    name: string
    age: number
}

/*** Test ***/

const app = createTestApp(['users'] as const)
const users = app.service('users').hooks([
    updateHistory()
])

// remove all users
afterEach(() => getInternalServiceMethods(users).$remove(null))

describe('create method', () => {
    //
    it('initializes history', async () => {

        const alice = await users
            .create(
                { name: 'Alice' },
                {
                    user: { _id: 'admin' } as User
                } as Params
            )

        expect(alice.history).toEqual([{
            method: 'create',
            timestamp: expect.any(Number),
            signature: 'admin',
            data: {
                name: 'Alice'
            }
        }])
    })

    //
    it('ignores provided history field', async () => {

        const bob = await users.create({
            name: 'Bob',
            history: [{
                thing: 'invalid history declaration'
            }]
        })

        expect(bob.history).toEqual([{
            method: 'create',
            timestamp: expect.any(Number),
            signature: null,
            data: {
                name: 'Bob'
            }
        }])

    })
})

describe('remove method', () => {

    it('returns record with removed history entry', async () => {

        const joe1 = await users.create({ name: 'Joe' })

        const joe2 = await users.remove(joe1._id as number)

        expect(joe2.history).toEqual([
            {
                method: 'create',
                signature: null,
                timestamp: expect.any(Number),
                data: { name: 'Joe' }
            },
            {
                method: 'remove',
                signature: null,
                timestamp: expect.any(Number),
            },
        ])
    })
})

describe('patch method', () => {

    it('increments record history', async () => {

        let steve = await users.create({ name: 'Steve', age: 30 })
        steve = await users.patch(steve._id as number, { age: 31 })
        steve = await users.patch(steve._id as number, { age: 32 })

        expect(steve.history).toEqual([
            {
                method: 'create',
                signature: null,
                timestamp: expect.any(Number),
                data: { name: 'Steve', age: 30 }
            },
            {
                method: 'patch',
                signature: null,
                timestamp: expect.any(Number),
                data: { age: 31 }
            },
            {
                method: 'patch',
                signature: null,
                timestamp: expect.any(Number),
                data: { age: 32 }
            }
        ])
    })

    it(
        'collapses multiple entries from the same user ' +
        'within a certain interval into one update',

        async () => {

            const app = createTestApp(['users'] as const)
            const users = app.service('users').hooks([
                updateHistory({
                    collapseInterval: 100
                })
            ])

            const user: User = { _id: 'admin', age: 100, name: 'Boss' }

            const params = { user } as Params

            let robyn = await users.create({ name: 'Robin', age: 26 }, params)
            robyn = await users.patch(robyn._id as number, { age: 27 }, params)

            const timeStampOfFirstCollapsablePatch = robyn.history.at(-1).timestamp

            // on the off chance the next patch happens in less than a millisecond
            await milliseconds(10)

            robyn = await users.patch(robyn._id as number, { age: 25 }, params)
            robyn = await users.patch(robyn._id as number, { age: 23 }, params)
            robyn = await users.patch(robyn._id as number, { name: 'Robyn' }, params)

            expect(robyn.name).toBe('Robyn')
            expect(robyn.history).toEqual([
                {
                    method: 'create',
                    signature: 'admin',
                    timestamp: expect.any(Number),
                    data: { name: 'Robin', age: 26 }
                },
                {
                    method: 'patch',
                    signature: 'admin',
                    timestamp: timeStampOfFirstCollapsablePatch,
                    data: { name: 'Robyn', age: 23 }
                }
            ])
        })
})

describe('find method', () => {
    it('should throw', async () => {
        await expect(users.find())
            .rejects
            .toThrow('Cannot use updateHistory hook with \'find\' method')
    })
})

describe('get method', () => {
    it('should throw', async () => {
        await expect(users.get(-1))
            .rejects
            .toThrow('Cannot use updateHistory hook with \'get\' method')
    })
})

describe('revert query params', () => {

    it('history can be reverted with the $history query param', async () => {

        let alice = await users.create({ name: 'Alice', age: 30 })
        while (alice.age < 40)
            alice = await users.patch(alice._id, { age: (alice.age as number) + 1 })

        alice = await users.patch(alice._id, {}, {
            query: {
                $history: {
                    revert: 1
                }
            }
        })

        expect(alice.history).toEqual([{
            method: 'create',
            signature: null,
            timestamp: expect.any(Number),
            data: { name: 'Alice', age: 30 }
        }])
    })

    it('history can be spliced with the $history query param', async () => {

        let alice = await users.create({ name: 'Alice', age: 30 })
        while (alice.age < 40)
            alice = await users.patch(alice._id, { age: (alice.age as number) + 1 })

        alice = await users.patch(alice._id, {}, {
            query: {
                $history: {
                    splice: [1, 9]
                }
            }
        })

        expect(alice.history).toEqual([{
            method: 'create',
            signature: null,
            timestamp: expect.any(Number),
            data: { name: 'Alice', age: 30 }
        }, {
            method: 'patch',
            signature: null,
            timestamp: expect.any(Number),
            data: { age: 40 }
        }])
    })
})
