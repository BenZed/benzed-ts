import React, { ReactElement, ReactNode } from 'react'

//// HomePage Component ////

interface HomePageProps {
    children?: ReactNode
}

const HomePage = (props: HomePageProps): ReactElement => {
    const { children, ...rest } = props
    
    return <>{children}</>
}

//// Exports ////

export default HomePage

export {
    HomePage,
    HomePageProps
}