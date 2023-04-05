import is, { IsType } from '@benzed/is'
import { each, Mutable, NamesOf, nil } from '@benzed/util'

import { MarkdownComponentMap } from './markdown-component'

//// Types ////

export type PresentationJson<T extends MarkdownComponentMap> =
    {
        readonly component?: NamesOf<T>
        readonly clear: boolean
        readonly markdown: string
    }

//// Helper ////

// TODO is-ts is gonna need: is.nameOf, is.symbolOf, is.indexOf, is.keyOf
const isNameOf = <T extends MarkdownComponentMap>(object: T): IsType<NamesOf<T>> =>
    is.string.asserts(
        name => name in object,
        name => `${name} invalid, must be: ${each.nameOf(object).toArray().join(' or ')}`
    ) as unknown as IsType<NamesOf<T>>

//// Main ////

/**
 * Given a component map and markdown content, create
 * a content json array.
 */
export function createPresentationJson<T extends MarkdownComponentMap>(
    components: T,
    markdown: string
): PresentationJson<T>[] {

    const COMPONENT_BOUNDARY = /^<!--\s(\!?@)(.+)\s-->/ // <!-- @ComponentName -->

    const validateName = isNameOf(components).validate
    const lines = markdown.split('\n')
    const contents: Mutable<PresentationJson<T>>[] = [{ 
        component: nil,
        clear: true,
        markdown: ''
    }]

    // create json for each boundary split
    for (const index of each.indexOf(lines)) {
        const line = lines[index]

        // add a new content json if we're on a component boundary
        const componentBoundary = COMPONENT_BOUNDARY.exec(line)
        if (componentBoundary) {
            const clear = componentBoundary[1].includes('!')
            const component = validateName(componentBoundary[2]) as Mutable<NamesOf<T>>
            contents.push({ component, clear, markdown: '' })

        // otherwise append line to the latest content json
        } else {
            const content = contents.at(-1) as Mutable<PresentationJson<T>>
            content.markdown += line
        }
    }

    return (
        contents.filter(content => content.component ?? content.markdown.length > 0) // non-empty
    ) as PresentationJson<T>[]
}

/**
 * Get the PresentationJson that would be in scope at the given index
 */
export function getCurrentPresentationJson<T extends MarkdownComponentMap>(
    presentationJson: PresentationJson<T>[],
    currentIndex: number
): PresentationJson<T>[] {

    let startIndex = 0

    // Webpack doesn't want to recognized .lastIndexOf, even with the lib compiler option set.
    for (let index = presentationJson.length - 1; index >= 0; index--) {
        if (index <= currentIndex && presentationJson[index].clear) {
            startIndex = index
            break
        }
    }

    return presentationJson.slice(startIndex, currentIndex + 1)
}