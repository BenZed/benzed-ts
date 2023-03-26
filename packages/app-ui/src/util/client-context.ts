import { App, AsClient } from '@benzed/app'

import { createContext, useContext } from 'react'

//// Exports ////

export const createClientContext = <T extends App>(app: AsClient<T>) => {
    const ClientContext = createContext(app)

    return {
        ClientProvider: ClientContext.Provider,
        useClient() { 
            const client = useContext(ClientContext)
            return client
        }
    }
}
