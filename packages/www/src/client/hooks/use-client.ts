import { useContext } from 'react'
import { ClientContext } from '../components/client-context'

//// Main ////

export const useClient = () => useContext(ClientContext)
