import { Command } from './command'
import { App } from '../../app'
import { Module } from '../../module'

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

//// Tests ////

class TestData extends Module {
    gets = 0
    posts: string[] = []
}

const testApp = new class TestApp extends App {

    data = new TestData

    get = Command.get(() => void this.data.gets++ ?? 'get' as const)

    post = Command.post((value: string) => this.data.posts.push(value))

}

const testServer = testApp.asServer()
const testClient = testApp.asClient()

beforeAll(async () => {
    await testServer.start()
    await testClient.start()
})

afterAll(async () => {
    await testClient.stop()
    await testServer.stop()
}, 1000)

describe('client -> server', () => {

    it('sends command to server', async () => {
        const get = await testClient.get()
        expect(get).toBe('get')

        expect(testServer.data.gets).toBe(1)
        expect(testClient.data.gets).toBe(0)

    })

})
