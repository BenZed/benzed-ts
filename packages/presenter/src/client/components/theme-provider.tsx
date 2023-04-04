import React, { ReactElement } from 'react'

import {
    MantineProvider,
    ColorSchemeProvider,
} from '@mantine/core'

import { useUserColorScheme, usePresenterTheme } from '../hooks' 

//// Types ////

interface ThemeProviderProps {
    children: ReactElement
}

//// Website Component ////

/**
 * Contains root providers and routing logic.
 */
const ThemeProvider = ({ children }: ThemeProviderProps): ReactElement => {

    const [ colorScheme, toggleColorScheme ] = useUserColorScheme()

    const presenterTheme = usePresenterTheme(colorScheme)

    return <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
    >
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            inherit
            theme={presenterTheme}
        >
            {children}
        </MantineProvider>
    </ColorSchemeProvider>
}

//// Exports ////

export default ThemeProvider

export {
    ThemeProvider
}