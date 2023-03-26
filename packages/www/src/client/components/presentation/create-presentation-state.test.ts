import { createElement } from 'react'

import { nil } from '@benzed/util'
import { test, expect, describe } from '@jest/globals'

import { createPresentationState } from './create-presentation-state'
import { createPresentationJson } from './create-presentation-json'
import { MarkdownComponentProps } from './markdown-component'

//// Setup ////

const Boundary = (props: MarkdownComponentProps) => 
    createElement('div', null, props.markdown)

const components = { Boundary }

const toStateGetter = (...lines: string[]) => {

    const contentJson = createPresentationJson(
        components,
        lines.join('\n')
    )

    return (index: number) => createPresentationState(contentJson, index)
}

//// Tests ////

test('builds content state up until a content index', () => {

    const [ contentState, lineIndex ] = toStateGetter(
        '# Title',
        '> Quote',
        '<!-- @Boundary -->',
        '`code`'
    )(0)

    expect(contentState).toEqual([{
        component: nil,
        content: '# Title\n> Quote\n'
    }])

    expect(lineIndex).toEqual(1)
})

describe('nesting', () => {

    const getNestedStateAt = toStateGetter(
        '# Title',
        '<!-- @Boundary -->',
        '- item 1',
        '    <!-- @Boundary -->',
        '    - sub item 1',
        '- item 2',
        '    <!-- @Boundary -->',
        '- item 3'
    )

    test('shows content up until next component boundary', () => {
        const [ contentState, lineIndex ] = getNestedStateAt(1)

        expect(contentState).toEqual([
            {
                component: undefined,
                content: '# Title\n'
            },
            {
                component: 'Boundary',
                content: '- item 1\n'
            }
        ])
        expect(lineIndex).toEqual(2)
    })

    test('shows content up until next nested boundary', () => {
        const [ contentState, lineIndex ] = getNestedStateAt(2)
        expect(contentState).toEqual([
            {
                component: undefined,
                content: '# Title\n'
            }, 
            {
                component: 'Boundary',
                content: '- item 1\n- item 2\n'
            },
            {
                component: 'Boundary',
                content: '- sub item 1\n'
            }
        ]) 
        expect(lineIndex).toEqual(4)
    })

    test('shows all content if at last index', () => {
        const [ contentState, lineIndex ] = getNestedStateAt(3)
        expect(contentState).toEqual([
            {
                component: undefined,
                content: '# Title\n'
            }, 
            {
                component: 'Boundary',
                content: '- item 1\n- item 2\n- item 3\n'
            },
            {
                component: 'Boundary',
                content: '- sub item 1\n'
            },
            {
                component: 'Boundary',
                content: ''
            }
        ]) 
        expect(lineIndex).toEqual(5)
    })

    test('throws if invalid index', () => {
        expect(() => getNestedStateAt(4))
            .toThrow('invalid content index 4, must be: 0 - 3')
    })

})
