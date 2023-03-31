import React, { ReactNode, ReactElement } from 'react'

//// Navigation Component ////

interface NavigationProps {
    children?: ReactNode
}

const Navigation = (props: NavigationProps): ReactElement => {
    const { children, ...rest } = props
    return <>{children}</>
}

//// Exports ////

export {
    Navigation,
    NavigationProps
}