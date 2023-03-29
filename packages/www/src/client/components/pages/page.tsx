import React, { ReactElement, ReactNode } from 'react'

import { Container } from '@mantine/core'

//// Page Component ////

interface PageProps {
    children?: ReactNode
}

const Page = (props: PageProps): ReactElement => {
    const { children } = props
    
    return <Container>{children}</Container>
}

//// Exports ////

export default Page

export {
    Page,
    PageProps
}