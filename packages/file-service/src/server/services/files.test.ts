import createFileServerApp from '../create-file-server-app'

/*** File Service Tests ***/

describe('File Service', () => {

    const fileServer = createFileServerApp()
    const files = fileServer.service('users')
    
    beforeAll(() => fileServer.start())
    afterAll(() => fileServer.teardown())

    it('is registered', () => {
        expect(files).toBeDefined()
    })

    it('uses pagination', async () => {

        const found = await files.find({})

        expect(found).toHaveProperty('total')
        expect(found).toHaveProperty('skip')
        expect(found).toHaveProperty('limit')

    })

})