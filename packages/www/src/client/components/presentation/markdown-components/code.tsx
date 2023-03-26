import is from '@benzed/is'

import React, { ReactElement } from 'react'

import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'

import ts from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { CodeProps } from 'react-markdown/lib/ast-to-react'

//// Code Component ////

const Code = ({ className, children: content, ...rest }: CodeProps): ReactElement => {

    const language = /language-(\w+)/.exec(className || '')

    return language && is.string.or.arrayOf(is.string)(content)
        ? (
            <SyntaxHighlighter
                style={oneDark}
                language={language[1]}
                children={content}
                showLineNumbers
                className={className}
            />
        )
        : <code className={className} {...rest} />
}


//// Register Syntax Highlight Languages ////

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('ts', ts)
SyntaxHighlighter.registerLanguage('json', json)

//// Exports ////

export {
    Code,
    CodeProps
}