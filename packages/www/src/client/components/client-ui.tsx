import React, { ReactElement, ReactNode } from 'react'

//// ClientUi Component ////

interface ClientUIProps {
    children?: ReactNode
}

const ClientUI = (props: ClientUIProps): ReactElement => {
    const { children, ...rest } = props
    
    return <>{children}</>
}

//// Exports ////

export default ClientUI

export {
    ClientUI,
    ClientUIProps
}