import React, { ReactElement } from 'react'
import { useSlides } from '../hooks'

import styled from 'styled-components'
import Markdown from './markdown'
import type { Slide as SlideJson } from '../../app/presentation'

//// Slide Component ////

interface SlideProps {
    slide: SlideJson
}

const Slide = styled((props: SlideProps): ReactElement => {

    const { slide, ...rest } = props

    return <Markdown content={slide.content} {...rest} />
})`
    display: block important!;
    margin: auto;
`

//// Exports ////

export default Slide

export {
    Slide,
    SlideProps
}