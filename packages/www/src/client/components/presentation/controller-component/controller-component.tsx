import React, { ReactElement, ReactNode } from 'react'

//// ControllerComponent Component ////

interface ControllerComponentProps {
    children?: ReactNode
}

const ControllerComponent = (props: ControllerComponentProps): ReactElement => {
    const { children, ...rest } = props

    return <>{children}</>
}

//// Exports ////

export default ControllerComponent

export {
    ControllerComponent,
    ControllerComponentProps
}