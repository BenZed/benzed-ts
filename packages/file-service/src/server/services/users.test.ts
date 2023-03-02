import createFileServerApp from '../create-file-server-app'

//// User Service Tests ////

describe(`User Service`, () => {

    const fileServer = createFileServerApp()
    const users = fileServer.service(`users`)
    
    beforeAll(() => fileServer.start())
    afterAll(() => fileServer.teardown())

    it(`is registered`, () => {
        expect(users).toBeDefined()
    })

    it(`uses pagination`, async () => {

        const found = await users.find({})

        expect(found).toHaveProperty(`total`)
        expect(found).toHaveProperty(`skip`)
        expect(found).toHaveProperty(`limit`)

    })

})