import React, { ReactElement } from 'react'
import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

//// SlideTitle Component ////

interface SlideTitleProps extends MarkdownComponentProps {}

const SlideTitle = (props: SlideTitleProps): ReactElement => {
    const { markdown } = props
    return <BasicMarkdown markdown={markdown} />
}

//// Exports ////

export default SlideTitle

export {
    SlideTitle,
    SlideTitleProps
}