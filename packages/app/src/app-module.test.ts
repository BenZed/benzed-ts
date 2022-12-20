
import { AppModule, ExecutableAppModule } from './app-module'

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Setup ////

class Test extends AppModule<void> { /**/ }

//// Tests ////

it('.start() cannot be called consecutively', async () => {
    const test = new Test()
    try {
        await test.start()
        await test.start()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has already been started`)
    }
    expect.assertions(1)
})

it('.stop() cannot be called until started', async () => {
    const test = new Test()
    try {
        await test.stop()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has not been started`)
    }
    expect.assertions(1)
})

it('.stop() cannot be called consecutively', async () => {
    const test = new Test()
    try {
        await test.start()
        await test.stop()
        await test.stop()
    } catch (e: any) {
        expect(e.message).toContain(`${test.name} has not been started`)
    }
    expect.assertions(1)
})

it('callable module', () => {
    const executable = new ExecutableAppModule((x: { foo: string }) => ({ ...x, count: 0 }), null)
    expect(executable({ foo: 'string' })).toEqual({ foo: 'string', count: 0 })
})