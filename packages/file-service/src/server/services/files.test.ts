import createFileServerApp from '../create-file-server-app'
import { $file, File } from '../schemas'

/*** File Service Tests ***/

describe('File Service', () => {

    const fileServer = createFileServerApp()
    const files = fileServer.service('files')
    
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

    describe('create', () => {

        let file: File
        beforeAll(async () => {
            file = await files.create({ 
                name: 'hey.txt', 
                uploader: null, 
                size: 100
            })
        })

        it('creates valid files', () => {
            expect(() => $file.validate(file)).not.toThrow()
        })

        it('removes extension from name', () => {
            expect(file.name).not.toContain(file.ext)
        })
    })
})