import { App } from './app'

import { it, test, expect, describe } from '@jest/globals'
import { Module } from './module'
import { Runnable, Validateable } from './traits'
import { Client } from './modules'

//// Setup ////

class TestApp extends App { /**/ }

class StatelessModule extends Module {
    get [Module.state]() {
        return {}
    }
}

class TestModule extends Module.add(StatelessModule, Runnable, Validateable) {

    validated = 0
    protected _onValidate() {
        this.validated++
    }

    started = 0
    protected _onStart() {
        this.started++
    }

    stopped = 0
    protected _onStop() {
        this.stopped++
    }
}

//// Tests ////

describe('OnValidate', () => {
    test('throws error if App is nested in another App', async () => {
        const parent = new class ParentApp extends App {
            bad = new TestApp()
        }

        await expect(parent.start()).rejects.toThrow('must be the root module')
    })

    test('does not throw error if App is not nested in another App', async () => {
        const testApp = new TestApp()

        await expect(testApp.start()).resolves.toBe(undefined)
    })
})

describe('app.start', () => {
    test('runs onValidate method on all applicable sub modules', async () => {

        const testApp = new class extends TestApp {
            module = new TestModule()
        }

        expect(
            Validateable.is(testApp.module)
        ).toBe(true)

        await expect(testApp.start())
            .resolves
            .toBe(undefined)

        expect(testApp.module.validated).toBe(1)
    })

    test('runs onStart method on all applicable sub modules', async () => {
        const testApp = new class extends TestApp {
            testModule = new TestModule()
        }

        await expect(testApp.start())
            .resolves
            .toBe(undefined)

        expect(testApp.testModule.started).toBe(1)
    })  

    test('throws error if started more than once consecutively', async () => {
        const testApp = new TestApp()

        await expect(testApp.start()).resolves.toBe(undefined)
        await expect(testApp.start()).rejects.toThrow('already running')
    })
})

describe('app.stop', () => {

    test('cannot be stopped if app has not been started', async () => {
        await expect(new TestApp().stop())
            .rejects
            .toThrow('is not running')
    })

    test('runs onStop method on all applicable sub modules', async () => {
        const testApp = new class extends TestApp {
            testModule = new TestModule()
        }

        await expect(testApp.start()).resolves.toBe(undefined)
        await expect(testApp.stop()).resolves.toBe(undefined)

        expect(testApp.testModule.stopped).toBe(1)
    })

    test('throws error if stopped more than once consecutively', async () => {
        const testApp = new TestApp()

        await expect(testApp.start()).resolves.toBe(undefined)
        await expect(testApp.stop()).resolves.toBe(undefined)
        await expect(testApp.stop()).rejects.toThrow('is not running')
    })
})

describe('asClient', () => {

    it('adds a client to the app', () => {
        const testApp = new TestApp()
        const testAppClient = testApp.asClient()

        expect(testAppClient.client).toBeInstanceOf(Client)
        expect(testAppClient).not.toBe(testApp)

        // @ts-expect-error type for asClient shouldn't exist
        void testAppClient.asClient

        // @ts-expect-error type for asServer shouldn't exist
        void testAppClient.asServer
    })

})