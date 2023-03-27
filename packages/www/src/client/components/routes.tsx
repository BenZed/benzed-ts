import React, { ReactElement, ReactNode } from 'react'

//// Routes Component ////

interface RoutesProps {
    children?: ReactNode
}

const Routes = (props: RoutesProps): ReactElement => {
    const { children, ...rest } = props
    
    return <>{children}</>
}

//// Exports ////

export default Routes

export {
    Routes,
    RoutesProps
}