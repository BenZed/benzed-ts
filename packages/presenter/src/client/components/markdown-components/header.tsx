import React, { ReactElement } from 'react'
import { BasicMarkdown } from '../presentation'
import { MarkdownComponentProps } from '../presentation/markdown-component'

//// SlideTitle Component ////

interface HeaderProps extends MarkdownComponentProps {}

const HeaderTitle = (props: HeaderProps): ReactElement => {
    const { markdown } = props
    return <BasicMarkdown markdown={markdown} />
}

//// Exports ////

export default HeaderTitle

export {
    HeaderTitle,
    HeaderProps
}