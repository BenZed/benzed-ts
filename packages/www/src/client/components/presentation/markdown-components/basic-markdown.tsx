
import React, { ReactElement, ComponentProps } from 'react'

import ReactMarkdown from 'react-markdown'
import { MarkdownComponentProps } from '../markdown-component'

//// Markdown Component ////

type ReactMarkdownProps = ComponentProps<typeof ReactMarkdown>
type ReactMarkdownComponents = NonNullable<ReactMarkdownProps['components']>

//// Markdown Component ////

interface BasicMarkdownProps extends ReactMarkdownComponents, MarkdownComponentProps { }

const BasicMarkdown = (props: BasicMarkdownProps): ReactElement => {
    const { markdown, ...components } = props

    return <ReactMarkdown
        children={markdown}
        components={components}
    />
}

//// Exports ////

export default BasicMarkdown

export {
    BasicMarkdown,
    BasicMarkdownProps
}