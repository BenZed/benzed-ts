import React, { ReactElement, ReactNode } from 'react'
import { useSlide } from '../hooks'

//// Slide Component ////

interface SlideProps {
    children?: ReactNode
}

const Slide = (props: SlideProps): ReactElement => {
    const { children, ...rest } = props

    const [ slide ] = useSlide()

    return <> Slide: {slide}</>
}

//// Exports ////

export default Slide

export {
    Slide,
    SlideProps
}