
import { NamesOf } from '@benzed/util'

import { MarkdownComponentMap } from './markdown-component'
import { PresentationJson } from './create-presentation-json'

//// Types ////

interface PresentationState<P extends MarkdownComponentMap> {
    readonly component?: NamesOf<P>
    readonly markdown: string 
}

//// Main ////

function createPresentationState<P extends MarkdownComponentMap>(
    presentationJson: PresentationJson<P>[],
    index: number
): [ state: PresentationState<P>[], lineIndex: number ] {

    const contentAtIndex = presentationJson.at(index)
    const contentAtNextIndex = presentationJson.at(index + 1)

    //
    if (presentationJson.length === 0 || !contentAtIndex)
        return [[], 0]

    //
    const states: PresentationState<P>[] = []
    let lineIndex = 0

    //
    for (const content of presentationJson) {

        if (content === contentAtNextIndex)
            break

        lineIndex = content.index

        const state = {
            component: content.component,
            markdown: ''
        }

        for (const line of content.lines) {
            if (
                !contentAtNextIndex || 
                line.index <= contentAtNextIndex.index
            ) {
                lineIndex = line.index
                state.markdown += line.markdown + '\n'
            }
        }

        if (state.markdown || state.component)
            states.push(state)
    }

    //
    return [ states, lineIndex ]
}

//// Exports ////

export default createPresentationState

export {
    createPresentationState,
    PresentationState
}