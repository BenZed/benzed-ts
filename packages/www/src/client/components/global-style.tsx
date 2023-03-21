import { createGlobalStyle } from 'styled-components'

//// GlobalStyle Component ////

export const BG_COLOR = '#272727'

export const FG_COLOR = '#e1e1e1'

export const ACCENT_COLOR = '#a14523'

export const GlobalStyle = createGlobalStyle`

    html {
        font-family: Helvetica;
        background: ${BG_COLOR};
        color: ${FG_COLOR};
    }

    #benzed-www {
        
        display: flex;

        flex-direction: column;
        align-items: center;

        width: 100vw;
        height: 100vh;
    }

`