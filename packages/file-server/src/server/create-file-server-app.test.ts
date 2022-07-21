import { createFileServerApp, FileServerApp } from './create-file-server-app'

describe('createFileServerApp', () => {

    let fileServer: FileServerApp
    beforeAll(() => {
        fileServer = createFileServerApp()
    })

    it('creates a file server app', () => {
        expect(fileServer).toHaveProperty('log')
    })

})