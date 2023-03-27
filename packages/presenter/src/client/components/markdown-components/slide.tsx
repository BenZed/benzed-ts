import React, { ReactElement } from 'react'
import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

//// SlideTitle Component ////

interface SlideProps extends MarkdownComponentProps {}

const Slide = (props: SlideProps): ReactElement => {
    const { markdown } = props
    return <BasicMarkdown markdown={markdown} />
}

//// Exports ////

export default Slide

export {
    Slide,
    SlideProps
}