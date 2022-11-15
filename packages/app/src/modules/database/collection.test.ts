import App from '../../app'

import $, { Infer } from '@benzed/schema'

import { Collection } from './collection'
import { MongoDb } from './mongodb'

//// Setup ////

interface User extends Infer<typeof $user>{}
const $user = $.shape({

    name: $
        .string
        .length('>', 0),

    email: $
        .string
        .format('email'),

    password: $
        .string
        .length('>=', 8)
        .name('password')

})

//// Tests ////

let users: Collection<User>
beforeAll(() => {
    users = Collection.create<User>({
        name: 'users',
        schema: $user
    })
})

it('is sealed', () => {
    // @ts-expect-error Sealed
    void class extends Collection {}
})

it('takes a collection name and a schema', () => {
    expect(users.settings.name)
        .toEqual('users')

    expect(users.settings.schema)
        .toBe($user)
})

it('requires a database when running', () => {
    expect(() => users.database)
        .toThrow('Collection is missing module')
})

describe('operations', () => {

    let app: App<[MongoDb, Collection<User>]>
    let collection: Collection<User>
    beforeAll(() => {

        const database = MongoDb.create({ database: 'test' })
    
        app = App
            .create()
            .useModules(
                database,
                users
            )
            
        collection = app.getModule(Collection, true, 'siblings') as Collection<User>
    })

    beforeAll(() => app.start())
    afterAll(() => app.stop())

    describe('create', () => {

        it('validates data added to a collection', async () => {
            const newUser = await collection.create({
                email: 'person@email.com',
                name: 'Human Person',
                password: 'password'
            })
            
        })
    })
})