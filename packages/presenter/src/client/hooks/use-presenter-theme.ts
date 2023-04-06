import type { MantineThemeOverride, ColorScheme } from '@mantine/core'

//// Main ////

const usePresenterTheme = (colorScheme: ColorScheme): MantineThemeOverride => { 

    return {
        globalStyles: _ => ({

            // '@font-face': [
            //     {
            //         fontFamily: 'Libby',
            //         src: `url('${assets['libby-bold']}') format('woff2')`,
            //         fontStyle: 'bold',
            //     }, 
            //     {
            //         fontFamily: 'Libby',
            //         src: `url('${assets['libby-regular']}') format('woff2')`,
            //         fontStyle: 'normal',
            //     }
            // ],

        }),

        colorScheme

    }

}

//// Exports ////

export {
    usePresenterTheme
}