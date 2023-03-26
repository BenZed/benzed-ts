import { createContext, useContext } from 'react'
import { presenterClient } from '../../app'

//// Context ////

const ClientContext = createContext(presenterClient)

//// Exports ////

export const ClientProvider = ClientContext.Provider

export const useClient = () => useContext(ClientContext)
