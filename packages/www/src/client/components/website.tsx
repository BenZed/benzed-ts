import React, { ReactElement } from 'react'
import { Routes, Route } from 'react-router-dom'

import { MantineProvider } from '@mantine/core'

import { HomePage } from './pages'

import { theme } from '../theme'

//// Website Component ////

interface WebsiteProps {}

/**
 * Contains root providers and routing logic.
 */
const Website = (props: WebsiteProps): ReactElement => {

    const { } = props

    return <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={theme}
    >

        <Routes>
            <Route index path='/' element={<HomePage />} />
        </Routes>

    </MantineProvider>
}

//// Exports ////

export default Website

export {
    Website,
    WebsiteProps
}