
import { memoize } from '@benzed/util'

import { Provider, provideModule } from '../../../command'
import Auth from '../auth'

//// Hook ////

const provideAuth = memoize(
    <I extends object> (): Provider<I, Auth> => 
        provideModule<I, Auth, true>(
            Auth, 
            true, 
            'parents'
        )
)

//// Exports ////

export default provideAuth

export {
    provideAuth
}