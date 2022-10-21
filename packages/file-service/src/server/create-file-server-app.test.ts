
import {
    createFileServerApp,
    FileServerApp
} from './create-file-server-app'

let fileServer: FileServerApp
beforeAll(() => {
    fileServer = createFileServerApp()
})

it(`creates a file server app`, () => {
    expect(fileServer).toHaveProperty(`log`)
})

describe(`log() method`, () => {

    it(`is an instance of @benzed/util Logger`, () => {
        expect(fileServer.log).toBeInstanceOf(Function)
        expect(fileServer.log.info).toBeInstanceOf(Function)
        expect(fileServer.log.warn).toBeInstanceOf(Function)
        expect(fileServer.log.error).toBeInstanceOf(Function)
    })

})

describe(`running`, () => {

    beforeAll(async () => {
        try {
            await fileServer.start()
        } catch (e) {
            console.error(e)
            throw e
        }
    })

    afterAll(async () => {
        await fileServer.teardown()
    })

    it(`connects to database`, async () => {

        const db = await fileServer.db(`any-collection`)
        expect(db.constructor.name).toBe(`Collection`)
    })

})
