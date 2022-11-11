import { $path } from './types'

describe('$path', () => {

    it('validates paths', () => {
        expect($path.validate('ace')).toEqual('/ace')
        expect(() => $path.assert('ace')).toThrow('Must start with a "/"')
    })

    it('paths cannot contain multiple consecutive /', () => {
        expect($path.validate('//ace//')).toEqual('/ace/')
        expect(() => $path.assert('//ace//')).toThrow('Must not have multiple consecutive')
    })

    it('only slashes', () => {
        expect($path.validate('///')).toEqual('/')
    })

})