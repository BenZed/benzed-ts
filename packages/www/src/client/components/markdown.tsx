import is from '@benzed/is'

import React, { HTMLProps, ReactElement } from 'react'

import ReactMarkdown from 'react-markdown'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'

import ts from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { CodeProps } from 'react-markdown/lib/ast-to-react'
import { defined } from '@benzed/util'
import { useClient } from '../hooks'

//// Code Component ////

const Code = (props: CodeProps): ReactElement => {

    const language = /language-(\w+)/
        .exec(props.className || '')

    const { children: content } = props

    return language && is.string.or.arrayOf(is.string)(content)
        ? (
            <SyntaxHighlighter
                style={oneDark}
                language={language[1]}
                children={content}
                showLineNumbers
            />
        )
        : <code className={props.className} {...props} />
}

const Anchor = ({ href, children, ...rest }: HTMLProps<HTMLAnchorElement>): ReactElement => {

    const client = useClient()

    console.log({ href })

    return <a href={href} {...rest} >{children}</a>
}

//// Markdown Component ////

interface MarkdownProps {
    content: string,
    code?: (props: HTMLProps<HTMLSpanElement>) => ReactElement
    a?: (props: HTMLProps<HTMLAnchorElement>) => ReactElement
}

const Markdown = (props: MarkdownProps): ReactElement => {
    const { content, code = Code, a = Anchor, ...rest } = props

    return <ReactMarkdown
        children={content}
        components={defined({ code, a })}

        {...rest}
    />
}

//// Register Syntax Highlight Languages ////

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('ts', ts)
SyntaxHighlighter.registerLanguage('json', json)

//// Exports ////

export default Markdown

export {
    Markdown,
    MarkdownProps
}