
import React, { lazy, ReactElement, ComponentProps } from 'react'

import { MarkdownComponentProps } from '../markdown-component'

//// Dynamic Import Components ////

const ReactMarkdown = lazy(() => import('react-markdown'))

//// Types ////

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