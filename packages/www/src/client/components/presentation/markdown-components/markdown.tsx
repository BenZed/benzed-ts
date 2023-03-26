
import React, { ReactElement, ComponentProps } from 'react'

import ReactMarkdown from 'react-markdown'
import { ContentComponentProps } from '../content/content'

//// Markdown Component ////

type ReactMarkdownProps = ComponentProps<typeof ReactMarkdown>
type ReactMarkdownComponents = NonNullable<ReactMarkdownProps['components']>

//// Markdown Component ////

interface MarkdownProps extends ReactMarkdownComponents, ContentComponentProps { }

const Markdown = (props: MarkdownProps): ReactElement => {
    const { content, ...components } = props

    return <ReactMarkdown
        children={content}
        components={components}
    />
}

//// Exports ////

export default Markdown

export {
    Markdown,
    MarkdownProps
}