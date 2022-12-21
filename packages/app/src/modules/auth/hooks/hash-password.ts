import { memoize, nil } from '@benzed/util'

import { CommandHook } from '../../command'
import Auth from '../auth'

//// Main ////

const hashPassword = memoize(<I extends { password?: string }>(): CommandHook<I, I> => 
    async (input, cmd) => {

        const { password } = input

        const auth = cmd.find.inParents(Auth)

        const output = {
            ...input,
            password: password 
                ? await auth.hashPassword(password) 
                : nil,
        } as I

        //
        return output
    })

//// Exports ////

export default hashPassword

export {
    hashPassword
}