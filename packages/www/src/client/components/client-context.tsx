import { createContext, useContext } from 'react'
import { client } from '../../app'

//// Context ////

const ClientContext = createContext(client)

//// Exports ////

export const ClientProvider = ClientContext.Provider

export const useClient = () => useContext(ClientContext)
