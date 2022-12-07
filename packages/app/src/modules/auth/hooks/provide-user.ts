
import { Pipe } from '@benzed/util'

import { Provider } from '../../../command'

//// Hook ////

const provideUser = <I extends object, U extends object>(): Provider<I,U> => 
    Pipe.from((i: I) => [i, {} as U]) 

//// Helpers ////

//// Exports ////

export default provideUser

export {
    provideUser
}