import { MongoDb } from '../mongodb'

import { App } from '../../../app'
import { Service } from '../../../service'
import { Command } from '../../../command'

import $ from '@benzed/schema'
import { RecordCollection } from '..'
import toDatabase from './to-database'
import { HttpMethod } from '../../connection'

//// Setup ////

const base = App
    .create()
    .useModule(MongoDb.create({ database: 'test' }))

const $todoData = $({
    completed: $.boolean,
    description: $.string
})

const $todoQuery = $({
    query: $.object
})

const $todoId = $({
    _id: $.string,
})

const $todo = $({
    ...$todoId.$,
    ...$todoData.$
})

const todos = Service
    .create()
    .useModules(
        Command.create($todoData).useHook(toDatabase(HttpMethod.Post, 'todos')),
        Command.update($todo).useHook(toDatabase(HttpMethod.Patch, 'todos')),
        Command.remove($todoId).useHook(toDatabase(HttpMethod.Delete, 'todos')),
        Command.get($todoId).useHook(toDatabase(HttpMethod.Get, 'todos')),
        Command.find($todoQuery).useHook(toDatabase(HttpMethod.Get, 'todos')),
    )

const app = base.useService('/todos', todos)

let collection: RecordCollection<object>
let _id: string

//// Tests ////

beforeAll(() => app.start())
beforeAll(async () => {

    collection = app
        .getModule(MongoDb, true)
        .getCollection('todos')

    const record = await collection.create({ completed: false, description: '' })
    _id = record._id
})
afterAll(() => app.stop())

it('create toDatabase()', async () => {

    const { total: preTotal } = await collection.find({})

    const record = await app.execute(
        'todosCreate', 
        { completed: false, description: 'New Todo' }
    )

    const { records, total: postTotal } = await collection.find({})

    expect(records.some(r => r._id === record._id)).toBe(true)
    expect(postTotal).toEqual(preTotal + 1)
    expect($todoData.is(record)).toBe(true)
})

it('update toDatabase()', async () => {

    const { total: preTotal } = await collection.find({})

    const record = await app.execute(
        'todosUpdate', 
        { _id, completed: false, description: 'Updated Todo' }
    )
    const { records, total: postTotal } = await collection.find({})

    expect($todoData.is(record)).toBe(true)
    expect(records.some(r => r._id === _id)).toBe(true)
    expect(postTotal).toEqual(preTotal)

})

it('remove toDatabase()', async () => {
        
    const { _id } = await collection.create({ completed: false, description: 'Temp Todo' })

    const { total: preTotal } = await collection.find({})

    const record = await app.execute(
        'todosRemove', 
        { _id }
    )

    const { records, total: postTotal } = await collection.find({})

    expect($todoData.is(record)).toBe(true)
    expect(records.some(r => r._id === _id)).toBe(false)
    expect(postTotal).toEqual(preTotal - 1)
})

it('get toDatabase()', async () => {

    const { total: preTotal } = await collection.find({})

    const record = await app.execute(
        'todosGet', 
        { _id }
    )

    const { records, total: postTotal } = await collection.find({})

    expect($todoData.is(record)).toBe(true)
    expect(records.some(r => r._id === _id)).toBe(true)
    expect(postTotal).toEqual(preTotal)
})

it('find toDatabase()', async () => {

    const collectionFind = await collection.find({})
    const commandFind = await app.execute('todosFind', { query: {} })
    expect(collectionFind).toEqual(commandFind)
})
