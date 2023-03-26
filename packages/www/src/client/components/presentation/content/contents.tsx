import is from '@benzed/is'
import { each, nil } from '@benzed/util'

import React, { ReactElement } from 'react'

import { ContentComponent, ContentComponentMap } from './content'
import { ContentState } from './get-content-state'
import { ContentJson } from './create-content-json'
import { Markdown } from '../markdown-components'

//// EsLint ////

/* eslint-disable
    @typescript-eslint/no-explicit-any
*/

//// ContentLayout ////

interface ContentsProps<P extends ContentComponentMap> {
    readonly content: ContentState<P>[]
    readonly components: P
}

const Contents = <P extends ContentComponentMap>(props: ContentsProps<P>): ReactElement => {

    const { content, components } = props

    const contentsResolved = content.map(state => ({
        Component: getContentComponent(state.component, components),
        content: state.content
    }))

    return <>{contentsResolved.map(({ Component, content }, i) =>
        <Component 
            key={i} 
            content={content}
        />
    )}</>
}

//// Helper ////

const getContentComponent = <P extends ContentComponentMap>(name: string | nil, components: P): ContentComponent => {

    if (!name)
        return Markdown

    if (!(name in components)) {
        throw new Error(
            `No component named "${name}" in component list: ${each.nameOf(components)}`
        )
    }

    return components[name]
}

//// Exports ////

export default ContentJson

export {
    Contents,
    ContentJson,

    getContentComponent
}