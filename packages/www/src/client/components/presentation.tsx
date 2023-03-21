import { AsClient } from '@benzed/app'

import React, { ReactElement } from 'react'
import { Route, Routes } from 'react-router-dom'

import { WWW } from '../../app'

import Presenter from './presenter/presenter'
import { GlobalStyle } from './global-style'
import { ClientProvider } from './client-context'

import Slide from './slide'
import SlideTitle from './slide-title'

import { useSlides } from '../hooks'

//// Presentation Component ////

interface PresentationProps {
    readonly client: AsClient<WWW>
}

const Presentation = (props: PresentationProps): ReactElement => {

    const { client, ...rest } = props

    const [slides, current, setCurrent] = useSlides()

    const slide = slides.at(current)

    return <ClientProvider value={client} >

        <GlobalStyle />

        {slide && <SlideTitle slide={slide} />}

        {slide && <Slide slide={slide} />}

        <Routes>
            <Route
                path='/presenter'
                element={<Presenter
                    slides={slides}
                    current={current}
                    setCurrent={setCurrent}
                />}
            />
        </Routes>

    </ClientProvider>
}

//// Exports ////

export default Presentation

export {
    Presentation,
    PresentationProps
}