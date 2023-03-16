import { Command } from './command'
import { App } from '../../app'
import { Module } from '../../module'
import {

    it,
    expect,
    describe,

    beforeAll,
    afterAll

} from '@jest/globals'

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

for (const app of [testApp, testClient, testServer]) {

    describe(`${app.name} immutable tests`, () => {
        it(`${app.name} command path`, () => {
            expect(app.post.pathFromRoot).toEqual(['post'])
            expect(app.post.path).toEqual('post')

            expect(app.get.pathFromRoot).toEqual(['get'])
            expect(app.get.path).toEqual('get')
        })
        it(`${app.name} command parent`, () => {
            expect(app.get.parent).toBe(app)
            expect(app.post.parent).toBe(app)
        })
    })
}

describe('client -> server', () => {

    it('sends command to server', async () => {
        const get = await testClient.get()

        expect(testClient.data.gets).toBe(0)
        expect(get).toBe('get')
        expect(testServer.data.gets).toBe(1)
    })
})
