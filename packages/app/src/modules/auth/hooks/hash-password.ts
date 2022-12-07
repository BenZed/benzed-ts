import { Pipe, memoize } from '@benzed/util'

import provideAuth from './provide-auth'

import { CommandHook } from '../../../command'

//// Main ////

const hashPassword = memoize(<I extends { password?: string }>(): CommandHook<I, I> => 
    Pipe
        .from(provideAuth<I>())
        .to(async ([input, auth]) => {

            const { password } = input

            const output = {
                ...input,
                password: 
                    password && 
                    await auth.hashPassword(password),
            } as I

            //
            return output
        }))

//// Exports ////

export default hashPassword

export {
    hashPassword
}