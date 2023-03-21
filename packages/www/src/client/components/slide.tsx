import React, { ReactElement, ReactNode } from 'react'
import { useSlides } from '../hooks'

import styled from 'styled-components'
import Markdown from './markdown'

//// Slide Component ////

interface SlideProps {
    children?: ReactNode
}

const Slide = styled((props: SlideProps): null | ReactElement => {
    const { children, ...rest } = props

    const [slides, current] = useSlides()

    const slide = slides.at(current) ?? null

    return slide && <Markdown content={slide.content} />
})`
    display: block important!;
    margin: 1em;
`

//// Exports ////

export default Slide

export {
    Slide,
    SlideProps
}