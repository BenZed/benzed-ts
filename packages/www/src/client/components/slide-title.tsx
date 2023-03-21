import React, { ReactElement } from 'react'
import styled from 'styled-components'
import { Slide } from '../../app/presentation'
import { ACCENT_COLOR } from './global-style'
import Markdown from './markdown'

//// CurrentSlideTitle Component ////

interface SlideTitleProps {
    slide: Slide
}

const SlideTitle = styled(({ slide, ...rest }: SlideTitleProps): null | ReactElement => {
    return <div {...rest}>
        <Markdown content={`# ${slide.title}`} />
    </div>
})`

    background-color: ${ACCENT_COLOR};
    width: 100%;

    h1 {
        margin: 0.5em 2em 0.5em 2em;
        text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.3);
    }
`

//// Exports ////

export default SlideTitle

export {
    SlideTitleProps,
    SlideTitle
}