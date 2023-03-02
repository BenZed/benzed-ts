import { $path } from './schemas'

describe('$path.validate', () => {
 
    it('validates paths', () => {
        expect($path.validate('ace'))
            .toEqual('/ace')
    })

    it('paths cannot contain multiple consecutive /', () => {
        expect($path.validate('//ace'))
            .toEqual('/ace')

        expect($path.validate('//ace//of//base'))
            .toEqual('/ace/of/base')
    })

    it('handles only slashes', () => {
        expect($path.validate('///'))
            .toEqual('/') 
    })

    it('removes trailing slash', () => {
        expect($path.validate('ace/'))
            .toEqual('/ace')
    })

})
 