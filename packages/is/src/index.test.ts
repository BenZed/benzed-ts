import { TypeOf } from '@benzed/util'
import is from './index'

describe('Practical', () => {
    
    it('user schema', () => {

        const isUser = is({
            name: is.tuple(is.string.capitalize, is.string.capitalize).named('name'),
            type: 'user' as const,
            personal: {
                age: is.number.above(0),
                sex: is('male').or('female'), 
            },
            tasks: is.array.of(is.number.between(0, 10))
        }).named('user')

        console.log(isUser)

        interface User extends TypeOf<typeof isUser> {}

        const user = isUser.validate({  
            name: ['Ben', 'Gaumond'],
            type: 'user',
            personal: {
                age: 37,
                sex: 'male'
            },
            tasks: [5, -1] 
        })

    })

})
