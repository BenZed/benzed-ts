import React, { ReactElement, ReactNode } from 'react'

//// Page Component ////

interface PageProps {
    children?: ReactNode
}

const Page = (props: PageProps): ReactElement => {
    const { children, ...rest } = props
    
    return <>{children}</>
}

//// Exports ////

export default Page

export {
    Page,
    PageProps
}