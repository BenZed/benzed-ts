import { createContext } from 'react'
import { client } from '../../app'

//// Context ////

export const ClientContext = createContext(client)

export const ClientProvider = ClientContext.Provider

//// Hook ////
