import { DEFAULT_MONGODB_PORT } from '../constants'
import { 
    MongoDbCollection, 
    MongoDb, 
    
    Record,
    Id, 
    Paginated 
} from './mongodb'

/*** Setup ***/

const mongoDb = MongoDb.create({ 
    uri: `mongodb://127.0.0.1:<port>/<database>`,
    database: `app-ecs-test`,
    port: DEFAULT_MONGODB_PORT
})

let startErr: unknown
beforeAll(async () => {
    startErr = await mongoDb.start()
}, 500)

type Todo = { completed: boolean, description: string }

let id: Id
let getResult: Record<Todo> | null
let createResult: Record<Todo>
let updateResult: Record<Todo> | null
let removeResult: Record<Todo> | null
let findResult: Paginated<Todo>
let todos: MongoDbCollection<Todo>
beforeAll(async () => {

    todos = mongoDb.getCollection(`todos`)

    createResult = await todos.create({ 
        completed: false, 
        description: `build an app`
    })
    id = createResult[`_id`]

    getResult = await todos.get(id) 
    updateResult = await todos.update(id, { completed: true })
    findResult = await todos.find({})
    removeResult = await todos.remove(id)
})

let stopErr: unknown
afterAll(async () => {
    stopErr = await mongoDb.stop()
}, 500)

/*** Tests ***/

it(`.start()`, () => {
    expect(startErr).toBeUndefined()
})

it(`.stop()`, () => {
    expect(stopErr).toBeUndefined()
})

it(`.getCollection()`, () => {
    expect(todos).toBeInstanceOf(MongoDbCollection)
})

describe(`MongoDbCollection`, () => {

    it(`.create()`, () => {
        expect(typeof createResult._id).toBe(`string`)
        expect(createResult).toHaveProperty(`completed`, false)
        expect(createResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.get()`, () => {
        expect(getResult).toHaveProperty(`_id`, id)
        expect(getResult).toHaveProperty(`completed`, false)
        expect(getResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.get() returns null if there was no record to get`, async () => {
    // should no longer exist in collection, it's been deleted
        expect(await todos.get(id)).toEqual(null)
    })

    it(`.find()`, () => {
        expect(findResult).toHaveProperty(`total`, 1)
        expect(findResult).toHaveProperty(`records`, [updateResult])
        expect(findResult).not.toHaveProperty(`skip`)
        expect(findResult).not.toHaveProperty(`limit`)

    })

    it(`.update()`, () => {
        expect(updateResult).toHaveProperty(`_id`, id)
        expect(updateResult).toHaveProperty(`completed`, true)
        expect(updateResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.update() returns null if there was no record to update`, async () => {
    // should no longer exist in collection, it's been deleted
        expect(await todos.update(id, { completed: false })).toEqual(null)
    })

    it(`.remove()`, () => {
        expect(removeResult).toHaveProperty(`_id`, id)
        expect(removeResult).toHaveProperty(`completed`, true)
        expect(removeResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.remove() returns null if there is nothing to remove`, async () => {
    // should no longer exist in collection, it's been deleted
        expect(await todos.remove(id)).toEqual(null)
    })

    it(`.create()`, () => {
        expect(typeof createResult._id).toBe(`string`)
        expect(createResult).toHaveProperty(`completed`, false)
        expect(createResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.get()`, () => {
        expect(getResult).toHaveProperty(`_id`, id)
        expect(getResult).toHaveProperty(`completed`, false)
        expect(getResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.get() returns null if there was no record to get`, async () => {
    // should no longer exist in collection, it's been deleted
        expect(await todos.get(id)).toEqual(null)
    })

    it(`.update()`, () => {
        expect(updateResult).toHaveProperty(`_id`, id)
        expect(updateResult).toHaveProperty(`completed`, true)
        expect(updateResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.update() returns null if there was no record to update`, async () => {
    // should no longer exist in collection, it's been deleted
        expect(await todos.update(id, { completed: false })).toEqual(null)
    })

    it(`.remove()`, () => {
        expect(removeResult).toHaveProperty(`_id`, id)
        expect(removeResult).toHaveProperty(`completed`, true)
        expect(removeResult).toHaveProperty(`description`, `build an app`)
    })

    it(`.remove() returns null if there is nothing to remove`, async () => {
    // should no longer exist in collection, it's been deleted
        expect(await todos.remove(id)).toEqual(null)
    })

})
