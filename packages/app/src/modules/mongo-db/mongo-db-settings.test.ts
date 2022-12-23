import { $mongoDbSettings } from './mongo-db-settings'

describe('uri', () => {

    it('local default', () => {
        const { uri } = $mongoDbSettings
            .validate({ database: 'test' })
        expect(uri)
            .toContain('mongodb://127.0.0.1:<port>/<database>')
    })

    it('must include <database> tag', () => {
        expect(() => $mongoDbSettings.validate({ database: 'test', uri: 'mongodb://localhost:<port>'}))
            .toThrow('<database> tag required')
    })
})

describe('database', () => {
    it('required', () => {
        expect(() => $mongoDbSettings.validate({}))
            .toThrow('is required')
    })
})

