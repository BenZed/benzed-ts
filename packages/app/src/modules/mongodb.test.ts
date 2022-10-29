import { DEFAULT_MONGODB_PORT, MongoDb } from './mongodb'

/*** Setup ***/

const mongoDb = MongoDb.create({ 
    uri: `mongodb://localhost:<port>/<database>`,
    database: `app-ecs-test`,
    port: DEFAULT_MONGODB_PORT
})

let startErr: unknown
beforeAll(async () => {
    startErr = await mongoDb.start()
}, 10000)

let stopErr: unknown
afterAll(async () => {
    stopErr = await mongoDb.stop()
}, 10000)

/*** Tests ***/

it(`.start()`, () => {
    expect(startErr).toBeUndefined()
})

it(`.stop()`, () => {
    expect(stopErr).toBeUndefined()
})