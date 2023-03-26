import { pluck } from '@benzed/array'
import is, { IsType, Validates } from '@benzed/is'
import { each, Mutable, NamesOf, nil } from '@benzed/util'

import { ContentComponentMap } from './content'

//// Data ////

const NEST_TAB_SIZE = 4
const NEST_PREFIX = ' '.repeat(NEST_TAB_SIZE)

//// Types ////

export type ContentJson<P extends ContentComponentMap> =
    {
        readonly component?: NamesOf<P>
        readonly index: number
        readonly lines: readonly {
            readonly index: number
            readonly content: string
        }[]
    }

//// Helper ////

// TODO is-ts is gonna need: is.nameOf, is.symbolOf, is.indexOf, is.keyOf
const isNameOf = <P extends ContentComponentMap>(object: P): IsType<NamesOf<P>> =>
    is.string.asserts(
        name => name in object,
        name => `${name} invalid, must be: ${each.nameOf(object).toArray().join(' or ')}`
    ) as unknown as IsType<NamesOf<P>>

function createRawContentJson<P extends ContentComponentMap>(
    lines: readonly string[],
    validateName: Validates<NamesOf<P>>,
    indexOffset = 0
): Mutable<ContentJson<P>>[] {
    
    const COMPONENT_BOUNDARY = /^<!--\s@(.+)\s-->/ // <!-- @ComponentName -->

    const contents: Mutable<ContentJson<P>>[] = [{ 
        component: nil, 
        index: indexOffset, 
        lines: [] 
    }]

    // create json for each boundary split
    for (const index of each.indexOf(lines)) {
        const line = lines[index]

        // add a new content json if we're on a component boundary
        const componentBoundary = COMPONENT_BOUNDARY.exec(line)
        if (componentBoundary) {
            const component = validateName(componentBoundary[1]) as Mutable<NamesOf<P>>
            contents.push({ component, index: index + indexOffset, lines: [] })

        // otherwise append line to the latest content json
        } else {
            contents.at(-1)?.lines.push({
                index: index + indexOffset,
                content: line
            })
        }
    }

    return contents
    // omit empty content
        .filter(content => content.component ?? content.lines.length > 0)
}

function createNestedContentJson<P extends ContentComponentMap>(
    lines: readonly string[],
    validateName: Validates<NamesOf<P>>,
    indexOffset = 0
) {

    const contents = createRawContentJson(lines, validateName, indexOffset)

    // flatten nested content
    for (let i = 0; i < contents.length; i++) {
        const content = contents[i]

        // determine if there is any nested content
        const nestedLines = pluck(
            content.lines,
            (line) => line.content.startsWith(NEST_PREFIX)
        )
        if (nestedLines.length === 0)
            continue

        // convert nested lines into raw lines
        const nestedLinesRaw = nestedLines
            .map(line => line.content.replace(NEST_PREFIX, ''))

        // create nested content
        const nestedContent = createNestedContentJson(
            nestedLinesRaw,
            validateName,
            // offset index
            nestedLines[0].index
        )

        // insert nested content
        contents.splice(i + 1, 0, ...nestedContent)

        // offset next index
        i += nestedContent.length
    }

    return contents
}

//// Main ////

/**
 * Given a component map and markdown content, create
 * a content json array.
 */
export function createContentJson<P extends ContentComponentMap>(
    components: P,
    content: string
) {
    const validateName = isNameOf(components).validate
    const lines = content.split('\n')
    return createNestedContentJson(lines, validateName)
}
