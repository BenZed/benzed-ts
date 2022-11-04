import { DatabaseCollection } from './database-collection'
import { MongoDb } from './mongodb'

import { App } from '../../app'
import { Service } from '../../service'
import { Command } from '../../command'

import $ from '@benzed/schema'

it('is sealed', () => {
    
    // @ts-expect-error Se zaled
    void class extends DatabaseCollection {}
})

const base = App
    .create()
    .useModule(MongoDb.create({ database: 'test' }))

it('placed as sibling to database', () => {

    const app = base.useModule(
        DatabaseCollection.create({ collection: 'todos' })
    )
  
    const db = app.getModule(MongoDb, true)
    const col = app.getModule(DatabaseCollection, true)

    expect(col.database).toBe(db)
})

it('placed as child to database', () => {

    const service = Service
        .create()
        .useModule(
            DatabaseCollection
                .create({ collection: 'todos' })
        )

    const app = base.useService('/todos', service)

    const db = app.getModule(MongoDb, true)
    const col = app.getModule(DatabaseCollection, true)
    expect(col.database).toBe(db)
})

it('placed in apps with multiple databases', () => {

    const admin = Service
        .create()
        .useModule(MongoDb.create({ database: 'private' }))
        .useModule(DatabaseCollection.create({ collection: 'jobs'}))

    const todos = Service
        .create()
        .useModule(MongoDb.create({ database: 'public' }))
        .useModule(DatabaseCollection.create({ collection: 'todos'}))

    const app = App.create()
        .useService('/todos', todos)
        .useService('/admin', admin)

    const todoC = app.getModule(
        t => t instanceof DatabaseCollection && t.settings.collection === 'todos', 
        true, 
        'children'
    )

    const todoA = app.getModule(
        t => t instanceof DatabaseCollection && t.settings.collection === 'jobs', 
        true, 
        'children'
    )

    expect(todoC.database).not.toBe(todoA.database)
})

describe('usage in commands', () => {

    const $todo = $({
        completed: $.boolean,
        description: $.string
    })

    const todos = Service
        .create()
        .useModule(
            DatabaseCollection.create()
        )
        .useModule(
            Command
                .create($todo)
                .useCreateDb()
        )

    const app = base.useService('/todos', todos)
    const collection = app.getModule(DatabaseCollection, true, 'children')

    beforeAll(() => app.start())
    afterAll(() => app.stop())

    it('.useCreateDb()', async () => {

        const record = await app.execute('todosCreate', { completed: false, description: 'New Todo' })
        const {records} = await collection.find({})
        expect(records.some(r => r._id === record._id)).toBe(true)

        expect($todo.is(record)).toBe(true)
    })

})