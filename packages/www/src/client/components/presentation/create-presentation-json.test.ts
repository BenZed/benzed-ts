import { createElement } from 'react'
import { createPresentationJson } from './create-presentation-json'
import { lines } from '../../../../../string/lib'

import { test, expect } from '@jest/globals'
import { MarkdownComponentProps } from './markdown-component'
import { nil } from '@benzed/util'

//// Tests ////
 
const Boundary = (props: MarkdownComponentProps) => 
    createElement('div', null, props.markdown)

test('creates content json for a given component map', () => {

    const markdown = lines(
        'Content without component',
        '<!-- @Boundary -->',
        'Content for Boundary component'
    )

    const content = createPresentationJson({ Boundary }, markdown)

    expect(content).toEqual([
        { 
            component: nil,
            index: 0,
            lines: [
                {
                    index: 0,
                    content: 'Content without component'
                }
            ] 
        },
        { 
            component: 'Boundary', 
            index: 1,
            lines: [
                {
                    index: 2,
                    content: 'Content for Boundary component'
                }
            ] 
        }
    ])

})

test('throws if components are missing', () => {
    const markdown = lines(
        '<!-- @MissingComponent -->'
    )
    expect(() => createPresentationJson({}, markdown)).toThrow('MissingComponent invalid')
})

test('handles nested content', () => {

    const markdown = lines(
        'Line 1',
        'Line 2',
        '    <!-- @Boundary -->',
        '    Boundary Line 1',
        'Line 3'
    )

    const content = createPresentationJson({ Boundary }, markdown)
    expect(content).toEqual([
        {
            component: nil,
            index: 0,
            lines: [
                { index: 0, content: 'Line 1' },
                { index: 1, content: 'Line 2' },
                { index: 4, content: 'Line 3' }
            ]
        },
        {
            component: 'Boundary',
            index: 2, 
            lines: [{
                index: 3,
                content: 'Boundary Line 1'
            }]
        }
    ]) 
})

test('handles deeply nested content', () => {

    const markdown = lines(
        'A1',
        'A2',
        '    <!-- @Boundary -->',
        '    B1',
        '        <!-- @Boundary -->',
        '        C1',
        '        <!-- @Boundary -->',
        '    B2',
        'A3',
        '<!-- @Boundary -->',
        'D1'
    )

    const content = createPresentationJson({ Boundary }, markdown)
    expect(content).toEqual([
        { 
            component: nil, 
            index: 0,
            lines: [
                { index: 0, content: 'A1' },
                { index: 1, content: 'A2' },
                { index: 8, content: 'A3' }
            ]
        },
        {
            component: 'Boundary', 
            index: 2,
            lines: [
                { index: 3, content: 'B1' },
                { index: 7, content: 'B2' }
            ]
        },
        { 
            component: 'Boundary',
            index: 4,
            lines: [
                { index: 5, content: 'C1' }
            ]
        },
        { 
            component: 'Boundary',
            index: 6,
            lines: []
        },
        {
            component: 'Boundary', 
            index: 9,
            lines: [
                { index: 10, content: 'D1' },
            ]
        }
    ])

})