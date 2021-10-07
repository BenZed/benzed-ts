import { Validator } from '../type'
import createTrimSanitizer from './trim'

describe('trim attribute sanitizer', () => {

    it('creates a trim sanitizer method', () => {
        const trim = createTrimSanitizer({ trim: true }) as Validator<string>

        expect(trim('  foo   ')).toEqual('foo')
    })

})