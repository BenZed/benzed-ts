
import {
    HookContext,
    Service,
} from '@feathersjs/feathers'

import { toEndPoint } from '../util'

import { isUnique } from './is-unique'

/* eslint-disable 
    @typescript-eslint/no-explicit-any, 
    @typescript-eslint/explicit-function-return-type
*/

/**
 * Ensure that this value wouldbe unique if it were converted to an endpoint
 */
export const isUniqueAsEndPoint = <
    R extends { endpoint: string },
    S extends Service<R>
>() => {
    
    const unique = isUnique<string, S>('endpoint')

    return (value: string | undefined, _record: R, context: HookContext<any, S>) =>
        
        unique(value && toEndPoint(value), _record, context).then(valueAsEndPoint => {

            // we don't actually want to save the endpoint value to the database, we just
            // want to validate that it is unique if converted to an endpoint
            void valueAsEndPoint

            return value
        })
}
