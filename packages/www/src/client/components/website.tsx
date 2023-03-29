import React, { ReactElement, useState } from 'react'
import { Routes, Route } from 'react-router-dom'

import { useThemeMode } from '@benzed/react'

import {
    MantineProvider as ThemeProvider,
    ColorSchemeProvider,
    ColorScheme
} from '@mantine/core'

import { HomePage } from './pages'

import { theme } from '../theme'

//// Hooks ////

const useColorScheme = (initialScheme: ColorScheme = 'dark') => {
    const [colorScheme, setColorScheme] = useThemeMode()

    const toggleColorScheme = (scheme?: ColorScheme) =>
        setColorScheme(scheme ?? (colorScheme === 'dark' ? 'light' : 'dark'))

    return [ colorScheme, toggleColorScheme ] as const
}

//// Website Component ////

interface WebsiteProps {}

/**
 * Contains root providers and routing logic.
 */
const Website = (props: WebsiteProps): ReactElement => {

    const { } = props

    const [colorScheme, toggleColorScheme] = useColorScheme()

    return <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}    
    >
        <ThemeProvider
            withGlobalStyles
            withNormalizeCSS
            inherit
            theme={{
                ...theme,
                colorScheme
            }}
        >
            <Routes>
                <Route index path='/' element={<HomePage />} />
            </Routes>

        </ThemeProvider>
    </ColorSchemeProvider>
}

//// Exports ////

export default Website

export {
    Website,
    WebsiteProps
}