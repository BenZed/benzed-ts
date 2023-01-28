import { isString } from '@benzed/util'
import { TypeValidator } from './type'

it('validates types', () => {

    const string = TypeValidator.create({
        name: 'string',
        is: isString
    })

})