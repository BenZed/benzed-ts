import React, { ReactElement } from 'react'

import { Container } from '@mantine/core'

import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

//// SlideTitle Component ////

interface SectionProps extends MarkdownComponentProps {}

const Section = (props: SectionProps): ReactElement => {
    const { markdown } = props

    return <Container>
        <BasicMarkdown markdown={markdown} />
    </Container>
}

//// Exports ////

export default Section

export {
    Section,
    SectionProps
}