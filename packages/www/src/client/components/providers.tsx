import { AsClient } from '@benzed/app'
import { WWW } from '../../app'

import React, { ReactElement} from 'react'

import { GlobalStyle } from './global-style'

//// IsPresentation Component ////

interface ProvidersProps {
    client: AsClient<WWW>
}

const Providers = ({ client }: ProvidersProps): ReactElement => {
    void client

    return <>
        <GlobalStyle/>
        BenZed WWW
    </>
}

//// Exports ////

export default Providers

export {
    Providers,
    ProvidersProps
}