import React, { ReactElement } from 'react'

//// GearsNavigation Component ////

interface GearsNavigationProps {
    endpoint: string
}

const GearsNavigation = (props: GearsNavigationProps): ReactElement => {
    const { endpoint } = props

    return <>{endpoint}</>
}

//// Exports ////

export {
    GearsNavigation,
    GearsNavigationProps
}