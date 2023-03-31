import React, { ReactElement } from 'react'
import { RouterProvider, RouterProviderProps } from 'react-router-dom'

import {
    MantineProvider as ThemeProvider,
    ColorSchemeProvider,
} from '@mantine/core'

import { useUserColorScheme, useWebsiteTheme } from '../hooks' 

//// Types ////

interface WebsiteProps {
    readonly router: RouterProviderProps['router']
}

//// Website Component ////

/**
 * Contains root providers and routing logic.
 */
const Website = ({ router }: WebsiteProps): ReactElement => {

    const [ colorScheme, toggleColorScheme ] = useUserColorScheme()

    const theme = useWebsiteTheme(colorScheme)

    return <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
    >
        <ThemeProvider
            withGlobalStyles
            withNormalizeCSS
            inherit
            theme={theme}
        >
            <RouterProvider router={router} />
        </ThemeProvider>
    </ColorSchemeProvider>
}

//// Exports ////

export default Website

export {
    Website
}