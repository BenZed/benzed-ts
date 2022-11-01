import disallow from './disallow'

import {
    createTestHookContext,
    createTestNextFunction
} from '../util.test'

//// Tests ////

for (const provider of [`rest`, `socketio`, `server`, `external`, `primus`] as const) {
    for (const method of [`get`, `patch`, `update`, `find`, `create`] as const) {

        it(`prevents configured "${provider}" from using "${method}" method`, async () => {

            const correctedProvider = provider === `server`
                ? undefined
                : provider === `external`
                    ? `rest`
                    : provider

            const ctx = createTestHookContext({
                serviceName: `users`,
                method,
                params: {
                    provider: correctedProvider
                }
            })

            const next = createTestNextFunction()

            await expect(disallow(provider)(ctx, next))
                .rejects
                .toHaveProperty(
                    `message`,
                    `Provider '${correctedProvider ?? `server`}' can not call '${method}'.`
                )

            expect(next.calls).toBe(0)
        })

    }
}

it(`can prevent method from being called at all`, async () => {

    const ctx = createTestHookContext({
        serviceName: `users`,
        method: `find`,
    })

    const next = createTestNextFunction()

    await expect(disallow()(ctx, next))
        .rejects
        .toHaveProperty(
            `message`,
            `Provider 'server' can not call 'find'.`
        )

    expect(next.calls).toBe(0)

})
