import React, { ReactElement } from 'react'

import { Global } from '@mantine/core'

import { libby } from '../assets'

//// GlobalStyles Component ////

const GlobalStyles = (): ReactElement => 
    <Global
        styles={[
            {
                '@font-face': {
                    fontFamily: 'Libby',
                    src: `url('${libby.bold}') format('woff2')`,
                    fontStyle: 'normal',
                },
            },
            {
                '@font-face': {
                    fontFamily: 'Libby',
                    src: `url('${libby.heavy}') format('woff2')`,
                    fontStyle: 'bold',
                },
            }
        ]}
    />

//// Exports ////

export default GlobalStyles

export {
    GlobalStyles
}