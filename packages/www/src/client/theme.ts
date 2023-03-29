import { MantineThemeOverride } from '@mantine/core'
import { libby } from './assets'

//// Exports ////

export const theme: MantineThemeOverride = {
    globalStyles: _theme => void console.log(_theme) ?? {

        '@font-face': [
            {
                fontFamily: 'Libby',
                src: `url('${libby.heavy}') format('woff2')`,
                fontStyle: 'bold',
            }, {
                fontFamily: 'Libby',
                src: `url('${libby.bold}') format('woff2')`,
                fontStyle: 'normal',
            }
        ],

        colors: {
            brand: 'orange'
        },

        primaryColor: 'brand'

    }
}