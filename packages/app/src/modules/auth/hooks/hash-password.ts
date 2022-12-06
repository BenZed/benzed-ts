import { Pipe, memoize } from '@benzed/util'

import provideAuth from './provide-auth'

import { CommandHook } from '../../../command'

//// Main ////

const hashPassword = memoize(<I extends { password?: string }>(): CommandHook<I, I> => 
    Pipe
        .from(provideAuth<I>())
        .to(([input, auth]) => {

            const { password } = input

            return {
                ...input,
                password: password?.repeat(2),
            } as I
        }))

//// Exports ////

export default hashPassword

export {
    hashPassword
}