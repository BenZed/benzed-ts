import React, { ReactElement, ReactNode, useEffect } from 'react'
import { client } from '../../app'

//// Hooks ////

const useClient = (client) => {

    useEffect(() => {
        console.log({ client })
    })

}

//// ClientUI Component ////

interface ClientUIProps {
    client: typeof client
    children?: ReactNode
}

const ClientUI = (props: ClientUIProps): ReactElement => {
    const { children, client, ...rest } = props

    useClient(client)
    
    return <>{children}</>
}

//// Exports ////

export default ClientUI

export {
    ClientUI,
    ClientUIProps
}