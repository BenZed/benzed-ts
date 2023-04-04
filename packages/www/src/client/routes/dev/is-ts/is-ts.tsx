import React, { ReactElement, ReactNode } from 'react'

//// IsTs Component ////

interface IsTsProps {
    children?: ReactNode
}

const IsTs = (props: IsTsProps): ReactElement => {
    const { children, ...rest } = props

    return <>Is Ts</>
}

//// Exports ////

export default IsTs

export {
    IsTs,
    IsTsProps
}