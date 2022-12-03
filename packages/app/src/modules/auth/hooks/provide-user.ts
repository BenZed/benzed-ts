
import { chain } from '@benzed/util'

import { CommandHook } from '../../../command'

import provideAuth from './provide-auth'

//// Hook ////

const provideUser = <I extends object, U extends object>(): CommandHook<I, I & { user: U }> => 
    chain(provideAuth())
        .link(({ auth, ...input }) => ({ ...input as I, user: {} as U }))

//// Helpers ////

//// Exports ////

export default provideUser

export {
    provideUser
}