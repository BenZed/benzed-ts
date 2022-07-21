
import {
    createFileServerApp,
    FileServerApp
} from './create-file-server-app'

describe('createFileServerApp', () => {

    let fileServer: FileServerApp
    beforeAll(() => {
        fileServer = createFileServerApp()
    })

    it('creates a file server app', () => {
        expect(fileServer).toHaveProperty('log')
    })

    describe('log() method', () => {
        it('is an instance of @benzed/util Logger', () => {
            expect(fileServer.log).toBeInstanceOf(Function)
            expect(fileServer.log.info).toBeInstanceOf(Function)
            expect(fileServer.log.warn).toBeInstanceOf(Function)
            expect(fileServer.log.error).toBeInstanceOf(Function)
        })
    })

})