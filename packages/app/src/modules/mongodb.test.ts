import { DEFAULT_MONGODB_PORT, MongoDb } from './mongodb'

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

let getResult: { _id: string }
let createResult: { _id: string }
beforeAll(async () => {

    const todos = mongoDb.getCollection(`todos`)

    createResult = await todos.create({ 
        completed: false, 
        description: `build an app`
    }) as { _id: string }

    getResult = await todos.get(createResult._id) as { _id: string }

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

it(`.create()`, () => {
    expect(typeof createResult._id).toBe(`string`)
    expect(createResult).toHaveProperty(`completed`, false)
    expect(createResult).toHaveProperty(`description`, `build an app`)
})

it(`.get()`, () => {

    expect(getResult).toHaveProperty(`_id`, createResult._id)
    expect(getResult).toHaveProperty(`completed`, false)
    expect(getResult).toHaveProperty(`description`, `build an app`)
})