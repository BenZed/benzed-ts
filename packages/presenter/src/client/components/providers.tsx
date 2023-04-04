import { AsClient } from '@benzed/app'
import { PresenterApp } from '../../app'

import React, { ReactElement} from 'react'

import { ClientProvider } from './client-context'
import { ClientPresentation } from './client-presentation'
import { ThemeProvider } from './theme-provider'

//// IsPresentation Component ////

interface ProvidersProps {
    readonly client: AsClient<PresenterApp>
}

const Providers = ({ client }: ProvidersProps): ReactElement => 

    <ThemeProvider>
        <ClientProvider value={client}>
            <ClientPresentation />
        </ClientProvider>
    </ThemeProvider>

//// Exports ////

export default Providers

export {
    Providers,
    ProvidersProps
}