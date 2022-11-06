import createFileServerApp from '../create-file-server-app'

//// Auth Service Tests ////

describe(`Authentication Service`, () => {

    const fileServer = createFileServerApp()

    const auth = fileServer.service(`authentication`)

    it(`is registered`, () => {
        expect(auth).toBeDefined()
    })

})