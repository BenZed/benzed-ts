import type { MantineThemeOverride, ColorScheme } from '@mantine/core'

import assets from '../assets'

//// Main ////

const usePresenterTheme = (colorScheme: ColorScheme): MantineThemeOverride => { 

    return {
        globalStyles: t => ({

            '@font-face': [
                {
                    fontFamily: 'Libby',
                    src: `url('${assets['libby-bold']}') format('woff2')`,
                    fontStyle: 'bold',
                }, 
                {
                    fontFamily: 'Libby',
                    src: `url('${assets['libby-regular']}') format('woff2')`,
                    fontStyle: 'normal',
                }
            ],

        }),

        colorScheme
    }

}

//// Exports ////

export {
    usePresenterTheme
}