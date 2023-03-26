
import { NamesOf } from '@benzed/util'

import { ContentComponentMap } from './content'
import { ContentJson } from './create-content-json'

//// Types ////

interface ContentState<P extends ContentComponentMap> {
    readonly component?: NamesOf<P>
    readonly content: string 
}

//// Main ////

function getContentState<P extends ContentComponentMap>(
    contents: ContentJson<P>[],
    contentIndex: number
): [ state: ContentState<P>[], lineIndex: number ] {

    const contentAtIndex = contents.at(contentIndex)
    if (!contentAtIndex) {
        throw new Error(
            `invalid content index ${contentIndex}, ` + 
            `must be: 0 - ${contents.length - 1}`
        )
    }

    const contentAtNextIndex = contents.at(contentIndex + 1)

    const states: ContentState<P>[] = []
    let lineIndex = 0

    for (const content of contents) {

        if (content === contentAtNextIndex)
            break

        lineIndex = content.index

        const state = {
            component: content.component,
            content: ''
        }

        for (const line of content.lines) {
            if (
                !contentAtNextIndex || 
                line.index <= contentAtNextIndex.index
            ) {
                lineIndex = line.index
                state.content += line.content + '\n'
            }
        }

        if (state.content || state.component)
            states.push(state)
    }

    return [ states, lineIndex ]
}

//// Exports ////

export default getContentState

export {
    getContentState,
    ContentState
}