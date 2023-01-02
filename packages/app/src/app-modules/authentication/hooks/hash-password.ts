import { memoize, applyResolver } from '@benzed/util'

import { CommandHook } from '../../command'
import Authentication from '../authentication'

//// Main ////

const hashPassword = memoize(<T extends { password?: string }>(): CommandHook<T, T> => 
    (input, ctx) => {

        const { password } = input

        const auth = ctx.node.assertModule.inSelf.or.inAncestors(Authentication)

        return applyResolver(
            password && auth.hashPassword(password),
            password => ({ ...input, password })
        ) as T
    })

//// Exports ////

export default hashPassword

export {
    hashPassword
}