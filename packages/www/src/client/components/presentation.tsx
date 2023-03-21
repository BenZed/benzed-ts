import { AsClient } from '@benzed/app'

import React, { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'

import { WWW } from '../../app'
import { ClientProvider } from './client-context'
import Container from './container'
import { GlobalStyle } from './global-style'
import Presenter from './presenter/presenter'
import Slide from './slide'

//// Presentation Component ////

interface PresentationProps {
    readonly client: AsClient<WWW>
}

const Presentation = (props: PresentationProps): ReactElement => {

    const { client, ...rest } = props

    return <ClientProvider value={client} >

        <GlobalStyle />

        <Container>
            <Slide />
        </Container>

        <Routes>
            <Route path='/presenter' element={<Presenter />} />
        </Routes>

    </ClientProvider>
}

//// Exports ////

export default Presentation

export {
    Presentation,
    PresentationProps
}