import React, { ReactElement } from 'react'

import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

//// SlideTitle Component ////

interface SectionProps extends MarkdownComponentProps {}

const Section = (props: SectionProps): ReactElement => {
    const { markdown } = props
    return <BasicMarkdown markdown={markdown} />
}

//// Exports ////

export default Section

export {
    Section,
    SectionProps
}