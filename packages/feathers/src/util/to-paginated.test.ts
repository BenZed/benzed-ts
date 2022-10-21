
import { toPaginated } from './to-paginated'

import { FeathersService } from '@feathersjs/feathers'
import { createTestApp } from '../util.test'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let service: FeathersService<any, any>

beforeAll(async () => {
    service = createTestApp([`users`]).service(`users`)
    await service.create({
        name: `Steve`
    })
    await service.create({
        name: `Joe`
    })
})

it(`casts array results to paginated results`, async () => {

    const users = await service.find()

    const paginated = {
        total: users.data.length,
        skip: 0,
        limit: expect.any(Number),
        data: users.data
    }

    expect(toPaginated(users)).toEqual(paginated)
    expect(toPaginated(users.data)).toEqual(paginated)

})