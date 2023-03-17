import { createContext, useContext } from 'react'
import { client } from '../../app'

//// Context ////

const ClientContext = createContext(client)

export const ClientProvider = ClientContext.Provider

//// Hook ////

export const useClient = () => useContext(ClientContext)