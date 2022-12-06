
import { Pipe } from '@benzed/util'

import { Provider } from '../../../command'

import provideAuth from './provide-auth'

//// Hook ////

const provideUser = <I extends object, U extends object>(): Provider<I,U> => 
    Pipe
        .from(provideAuth<I>())
        .to(([ input, auth ]) => [input, {} as unknown as U]) 

//// Helpers ////

//// Exports ////

export default provideUser

export {
    provideUser
}