import { memoize, Resolver } from '@benzed/util'

import { CommandHook } from '../../command'
import Authentication from '../authentication'

//// Main ////

const hashPassword = memoize(<T extends { password?: string }>(): CommandHook<T, T> => 
    (input, ctx) => {
 
        const { password } = input 

        const auth = ctx.node.assertModule.inSelf.or.inAncestors(Authentication)

        const hashed = password && auth.hashPassword(password)

        return new Resolver(hashed)
            .then(password => ({ ...input, password }))
            .value
    })

//// Exports ////

export default hashPassword

export {
    hashPassword
}