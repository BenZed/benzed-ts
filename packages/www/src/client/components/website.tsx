import React, { ReactElement, ReactNode } from 'react'

import { MantineProvider } from '@mantine/core'

//// Container Component ////

interface WebsiteProps {
    children?: ReactNode
}

const Website = (props: WebsiteProps): ReactElement => {

    const { children, ...rest } = props

    return <MantineProvider withGlobalStyles withNormalizeCSS theme={{}}>
        {
            
        }
    </MantineProvider>

}

//// Exports ////

export default Website

export {
    Website,
    WebsiteProps
}