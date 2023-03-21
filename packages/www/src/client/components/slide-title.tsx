import React, { ReactElement } from 'react'
import styled from 'styled-components'
import { Slide } from '../../app/presentation'
import { ACCENT_COLOR, BG_COLOR } from './global-style'

//// CurrentSlideTitle Component ////

interface SlideTitleProps {
    slide: Slide
}

const SlideTitle = styled(({ slide, ...rest }: SlideTitleProps): null | ReactElement => {
    return <div {...rest}>
        <h2>{slide.title}</h2>
    </div>
})`
    background-color: ${ACCENT_COLOR};
    width: 100%;
    h2 {
        margin: 0.5em;
        text-shadow: 3px 3px 3px rgba(0,0,0,0.25);
    }
`

//// Exports ////

export default SlideTitle

export {
    SlideTitleProps,
    SlideTitle
}