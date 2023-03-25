import React, { ReactElement } from 'react'
import { useMatch } from 'react-router-dom'

import Presenter from './presenter/presenter'
import { GlobalStyle } from './global-style'

import Slide from './slide'
import SlideTitle from './slide-title'

import { usePresentation } from '../hooks'

//// Presentation Component ////

interface PresentationProps { }

const Presentation = (_props: PresentationProps): ReactElement => {

    const [
        slides,
        current,
        setCurrent
    ] = usePresentation()

    const slide = slides.at(current.slide)

    const matchPresenter = useMatch('/presenter')

    return <>

        <GlobalStyle />

        {matchPresenter && <Presenter
            slides={slides}
            current={current}
            setCurrent={setCurrent}
        />}

        {slide && <SlideTitle slide={slide} />}

        {slide && <Slide slide={slide} current={current} />}

    </>
}

//// Exports ////

export default Presentation

export {
    Presentation,
    PresentationProps
}