import React, { ReactElement, ReactNode, useEffect } from 'react'
import { client } from '../../app'

//// Hooks ////

const useClient = (c: typeof client) => {

    useEffect(() => {
        console.log(c, 'ace')
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