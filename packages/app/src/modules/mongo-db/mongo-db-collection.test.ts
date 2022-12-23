
import {
    MongoDbCollection, 
    Record,
    Id, 
    Paginated,
} from './mongo-db-collection'

import { MongoDb } from './mongo-db'

import { io, nil } from '@benzed/util'
import $, { Infer } from '@benzed/schema'

//// Setup ////

interface Todo extends Infer<typeof $todo> {}
const $todo = $({ 
    completed: $.boolean, 
    description: $.string 
})

const mongoDb = MongoDb
    .create({ database: 'app-ecs-test' })
    .addCollection<'todos', Todo>('todos', $todo)

beforeAll(() => mongoDb.start())

let id: Id
let getResult: Record<Todo> | nil
let createResult: Record<Todo>
let updateResult: Record<Todo> | nil
let removeResult: Record<Todo> | nil
let findResult: Paginated<Todo>
let todos: MongoDbCollection<Todo>
beforeAll(async () => {

    await mongoDb.clearAllCollections()

    todos = mongoDb.getCollection('todos')
    createResult = await todos.create({ 
        completed: false, 
        description: 'build an app'
    })
    id = createResult['_id']

    getResult = await todos.get(id) 
    updateResult = await todos.update(id, { completed: true })
    findResult = await todos.find({})
    removeResult = await todos.remove(id)
})

afterAll(() => mongoDb.stop())

//// Tests ////

it('.create()', () => {

    expect(typeof createResult._id).toBe('string')
    expect(createResult).toHaveProperty('completed', false)
    expect(createResult).toHaveProperty('description', 'build an app')

})

it('.create() data validated', async () => {

    // @ts-expect-error Invalid
    const err = await todos.create({ description: '' }).catch(io)
    expect(err).toHaveProperty('path', ['completed'])
    expect(err).toHaveProperty('message', 'completed is required')

})

it('.get()', () => {

    expect(getResult).toHaveProperty('_id', id)
    expect(getResult).toHaveProperty('completed', false)
    expect(getResult).toHaveProperty('description', 'build an app')

})

it('.get() returns null if there was no record to get', async () => {

    // should no longer exist in collection, it's been deleted
    expect(await todos.get(id)).toEqual(null)

})

it('.find()', () => {

    expect(findResult).toHaveProperty('total', 1)
    expect(findResult).toHaveProperty('records', [updateResult])
    expect(findResult).not.toHaveProperty('skip')
    expect(findResult).not.toHaveProperty('limit')

})

it('.update()', () => {

    expect(updateResult).toHaveProperty('_id', id)
    expect(updateResult).toHaveProperty('completed', true)
    expect(updateResult).toHaveProperty('description', 'build an app')

})

it('.update() data validated', async () => {

    const { _id } = await todos.create({ description: 'Sup', completed: false })

    // @ts-expect-error Invalid Data
    const err = await todos.update(_id, { description: { foo: 'incorrect' } }).catch(io)

    expect(err).toHaveProperty('path', ['description'])
    expect(err).toHaveProperty('message', 'description must be a string')
})

it('.update() returns null if there was no record to update', async () => {

    // should no longer exist in collection, it's been deleted
    expect(await todos.update(id, { completed: false })).toEqual(null)

})

it('.remove()', () => {

    expect(removeResult).toHaveProperty('_id', id)
    expect(removeResult).toHaveProperty('completed', true)
    expect(removeResult).toHaveProperty('description', 'build an app')

})

it('.remove() returns null if there is nothing to remove', async () => {

    // should no longer exist in collection, it's been deleted
    expect(await todos.remove(id)).toEqual(null)

})

it('.create()', () => {

    expect(typeof createResult._id).toBe('string')
    expect(createResult).toHaveProperty('completed', false)
    expect(createResult).toHaveProperty('description', 'build an app')

})

it('.get()', () => {

    expect(getResult).toHaveProperty('_id', id)
    expect(getResult).toHaveProperty('completed', false)
    expect(getResult).toHaveProperty('description', 'build an app')

})

it('.get() returns null if there was no record to get', async () => {

    // should no longer exist in collection, it's been deleted
    expect(await todos.get(id)).toEqual(null)

})

it('.update()', () => {

    expect(updateResult).toHaveProperty('_id', id)
    expect(updateResult).toHaveProperty('completed', true)
    expect(updateResult).toHaveProperty('description', 'build an app')

})

it('.update() returns null if there was no record to update', async () => {

    // should no longer exist in collection, it's been deleted
    expect(await todos.update(id, { completed: false })).toEqual(null)

})

it('.remove()', () => {
    expect(removeResult).toHaveProperty('_id', id)
    expect(removeResult).toHaveProperty('completed', true)
    expect(removeResult).toHaveProperty('description', 'build an app')

})

it('.remove() returns null if there is nothing to remove', async () => {

    // should no longer exist in collection, it's been deleted
    expect(await todos.remove(id)).toEqual(null)

})
