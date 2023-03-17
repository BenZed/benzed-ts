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

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any,
*/

//// Tests ////

class TestData extends Module {
    gets = 0
    posts: string[] = []
}

const testApp = new class TestApp extends App {

    data = new TestData

    get = Command.get(function (this: any) {
        this.parent.data.gets++
        return this.parent.data.posts as string[]
    })

    post = Command.post(function (this: any, post: string) {
        this.parent.data.posts.push(post)
    })

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
        const gotten = await testClient.get()

        expect(testClient.data.gets).toBe(0)
        expect(gotten).toEqual([]) 
        expect(testServer.data.gets).toBe(1)
    }) 

    it('server state persists', async () => {
        await testClient.post('ace')
        const gotten = await testClient.get()

        expect(testClient.data.gets).toBe(0)
        expect(gotten).toEqual(['ace'])
        expect(testServer.data.gets).toBe(2)
    })

})
