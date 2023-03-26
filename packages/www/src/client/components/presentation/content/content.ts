import { ReactElement } from 'react-markdown/lib/react-markdown'

//// Presentation ////

interface ContentComponentProps {
    readonly content: string
}

type ContentComponent = (props: ContentComponentProps) => ReactElement

interface ContentComponentMap {
    [key: string]: ContentComponent
}

//// Exports ////

export {
    ContentComponent,
    ContentComponentProps,
    ContentComponentMap
}