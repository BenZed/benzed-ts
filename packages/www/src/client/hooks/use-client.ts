import { useContext } from 'react'
import { ClientContext } from '../components/client-context'

export const useClient = () => useContext(ClientContext)
