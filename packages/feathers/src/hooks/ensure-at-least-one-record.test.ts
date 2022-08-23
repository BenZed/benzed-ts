import ensureAtLeastOneRecord from './ensure-at-least-one-record'

import { createTestHookContext, createTestNextFunction, createTestApp } from '../util.test'

/*** Tests ***/

type Building = {
    name: string
    address: string
    owner: string
}

it('creates a new record if none are remain', async () => {

    const ctx = createTestHookContext({
        serviceName: 'buildings',
        method: 'remove',
    })

    const next = createTestNextFunction()

    const buildingService = ctx.app.service('buildings')

    expect(await buildingService.find({})).toHaveProperty('total', 0)

    const hook = ensureAtLeastOneRecord<Building>({})
    await hook(ctx, next)

    expect(await buildingService.find({})).toHaveProperty('total', 1)
    expect(next.calls).toBe(1)
})

it('does nothing if there is at least one record', async () => {

    const ctx = createTestHookContext({
        serviceName: 'buildings',
        method: 'remove',
    })

    await ctx.app.service('buildings').create({
        name: 'Test Building',
        address: '123 Test St',
        owner: 'Test Owner'
    })

    const next = createTestNextFunction()
    const buildingService = ctx.app.service('buildings')
    expect(await buildingService.find({})).toHaveProperty('total', 1)

    const hook = ensureAtLeastOneRecord<Building>({})
    await hook(ctx, next)

    expect(await buildingService.find({})).toHaveProperty('total', 1)
    expect(next.calls).toBe(1)

})

it('may only be called by the remove method', async () => {

    const app = createTestApp(['buildings'] as const)

    for (const method of ['find', 'get', 'create', 'update', 'patch']) {
        const ctx = createTestHookContext({
            app,
            serviceName: 'buildings',
            method,
        })

        const hook = ensureAtLeastOneRecord<Building>({})

        await expect(hook(ctx, createTestNextFunction()))
            .rejects
            .toThrow('should only be called by the \'remove\' method')
    }
})