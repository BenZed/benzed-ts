import { AsClient } from '@benzed/app'
import { PresenterApp } from '../../app'

import React, { ReactElement} from 'react'

import { GlobalStyle } from './global-style'
import { ClientProvider } from './client-context'
import { ClientPresentation } from './client-presentation'

//// IsPresentation Component ////

interface ProvidersProps {
    client: AsClient<PresenterApp>
}

const Providers = ({ client }: ProvidersProps): ReactElement => {

    return <ClientProvider value={client}>
        <ClientPresentation />
        <GlobalStyle/>
    </ClientProvider>
}

//// Exports ////

export default Providers

export {
    Providers,
    ProvidersProps
}