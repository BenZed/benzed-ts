import softDelete from './soft-delete'

import {
    createTestApp
} from '../util.test'

/* eslint-disable @typescript-eslint/no-explicit-any */

/*** Test ***/

describe('softDelete hook', () => {

    const app = createTestApp(['users'])
    const users = app.service('users').hooks([softDelete()])

    let joe: any
    beforeAll(async () => {
        joe = await users.create({ name: 'Joe' })
        await users.remove(joe._id)
    })

    describe('create method', () => {
        it('throws if delete query param is defined', async () => {

            const err = await users
                .create({ name: 'Johnson' }, { query: { $deleted: true } }).catch(e => e)

            expect(err).toHaveProperty('name', 'BadRequest')
            expect(err).toHaveProperty(
                'message',
                '$deleted param cannot be used with the \'create\' method.'
            )
        })
    })

    describe('remove method', () => {

        it('hides records insteand of deleting them', async () => {

            const joe2 = await (users as any)._get(joe._id)
            //                               ^ get without hooks

            // proves joe2 is still in the database 
            expect(joe2._id).toEqual(joe._id)
            expect(joe2.deleted).toBeTruthy()
        })

        it('throws on hidden records', async () => {
            const err = await users.remove(joe._id).catch(e => e)

            expect(err).toHaveProperty('name', 'NotFound')
            expect(err).toHaveProperty('message', `No record found for id '${joe._id}'`)
        })

        it('can permanently delete records with query param', async () => {
            const mike = await users.create({ name: 'Mike' })

            await users.remove(mike._id, { query: { $deleted: true } })

            const err = await (users as any)._get(mike._id).catch((e: any) => e)
            expect(err).toHaveProperty('name', 'NotFound')
            expect(err).toHaveProperty('message', `No record found for id '${mike._id}'`)
        })

        it('can permanently delete hidden records with query param', async () => {
            const mike = await users.create({ name: 'Mike' })

            const mikeDel = await users.remove(mike._id)
            expect(mikeDel).toHaveProperty('deleted')

            await users.remove(mike._id, { query: { $deleted: true } })

            const err = await (users as any)._get(mike._id).catch((e: any) => e)
            expect(err).toHaveProperty('name', 'NotFound')
            expect(err).toHaveProperty('message', `No record found for id '${mike._id}'`)
        })

        it('can restore hidden records with query param', async () => {

            const mike = await users.create({ name: 'Mike' })

            const mikeRemoved = await users.remove(mike._id)
            expect(mikeRemoved).toHaveProperty('deleted')

            const mikeRestore = await users.patch(mike._id, {}, { query: { $deleted: 'restore' } })
            expect(mikeRestore).toHaveProperty('deleted', null)

            const mikeGet = await (users as any)._get(mike._id)
            expect(mikeGet.deleted).toBeFalsy()
        })

        it('throws trying to restore non-hidden records', async () => {
            const mike = await users.create({ name: 'Mike' })

            const err = await users
                .patch(mike._id, {}, { query: { $deleted: 'restore' } })
                .catch(e => e)

            expect(err).toHaveProperty('name', 'NotFound')
            expect(err).toHaveProperty(
                'message',
                `No removed record found for id '${mike._id}'`
            )
        })

    })

    describe('get method', () => {

        it('throws on hidden records', async () => {

            const err = await users.get(joe._id).catch(e => e)

            expect(err).toHaveProperty('name', 'NotFound')
            expect(err).toHaveProperty('message', `No record found for id '${joe._id}'`)
        })

        it('throws if delete query param is set to restore', async () => {

            const err = await users.get(joe._id, { query: { $deleted: 'restore' } }).catch(e => e)

            expect(err).toHaveProperty('name', 'BadRequest')
            expect(err).toHaveProperty(
                'message',
                'Invalid $deleted param value: \'restore\' can only be ' +
                'used with the \'patch\' method.'
            )
        })

        it('can include delete records with query param', async () => {
            const joe2 = await users.get(joe._id, { query: { $deleted: true } })
            expect(joe2._id).toEqual(joe._id)
        })

    })

    for (const method of ['patch', 'update'] as const) {
        describe(`${method}`, () => {

            //
            it('throws on hidden records', async () => {

                const err = await users[method](joe._id, { name: 'alice' }).catch(e => e)

                expect(err).toHaveProperty('name', 'NotFound')
                expect(err).toHaveProperty('message', `No record found for id '${joe._id}'`)
            })

            if (method !== 'patch') {
                it('throws if delete query param is set to restore', async () => {

                    const err = await users[method](
                        joe._id,
                        { name: 'jane' },
                        {
                            query: {
                                $deleted: 'restore'
                            }
                        }
                    ).catch(e => e)

                    expect(err).toHaveProperty('name', 'BadRequest')
                    expect(err).toHaveProperty(
                        'message',
                        'Invalid $deleted param value: \'restore\' ' +
                        'can only be used with the \'patch\' method.'
                    )
                })
            }
        })
    }

    describe('find method', () => {
        //
        it('omits hidden records', async () => {
            const records = await users.find({})
            expect(
                records.data.find((r: any) => r._id === joe._id)
            ).toBe(undefined)
        })

        it('throws if delete query param is set to restore', async () => {

            const err = await users.find({ query: { $deleted: 'restore' } }).catch(e => e)

            expect(err).toHaveProperty('name', 'BadRequest')
            expect(err).toHaveProperty(
                'message',
                'Invalid $deleted param value: \'restore\' ' +
                'can only be used with the \'patch\' method.'
            )
        })
    })

    describe('option.deleteField', () => {
        it('sets the field that is used to hold the deleted date', async () => {
            const users = createTestApp(['users'])
                .service('users')
                .hooks([
                    softDelete({
                        deleteField: 'deletedAt'
                    })
                ])

            const mike = await users.create({ name: 'Mike' })

            const result = await users.remove(mike._id)
            expect(result).toHaveProperty('deletedAt')
        })
    })

    describe('option.deleteQueryParam', () => {
        it('sets the query param field name', async () => {
            const users = createTestApp(['users'])
                .service('users')
                .hooks([
                    softDelete({
                        deleteQueryParam: '$hidden'
                    })
                ])

            const err = await users
                .create({ name: 'Candice' }, { query: { $hidden: true } })
                .catch(e => e)
            expect(err).toHaveProperty('name', 'BadRequest')
            expect(err).toHaveProperty(
                'message',
                '$hidden param cannot be used with the \'create\' method.'
            )
        })
    })
})