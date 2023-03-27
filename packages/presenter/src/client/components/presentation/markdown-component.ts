import { ReactElement } from 'react-markdown/lib/react-markdown'

//// Presentation ////

interface MarkdownComponentProps {
    readonly markdown: string
}

type MarkdownComponent = (props: MarkdownComponentProps) => ReactElement

interface MarkdownComponentMap {
    [key: string]: MarkdownComponent
}

//// Exports ////

export {
    MarkdownComponent,
    MarkdownComponentProps,
    MarkdownComponentMap
}