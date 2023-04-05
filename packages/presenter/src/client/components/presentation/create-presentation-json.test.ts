import { createElement } from 'react'

import { test, expect } from '@jest/globals'
import { nil } from '@benzed/util'

import { createPresentationJson } from './create-presentation-json'
import { MarkdownComponentProps } from './markdown-component'

import { lines } from '../../../../../string'

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
            clear: true,
            markdown: 'Content without component'
        },
        { 
            component: 'Boundary', 
            clear: false,
            markdown: 'Content for Boundary component'
        }
    ]) 

})

test('throws if components are missing', () => {
    const markdown = lines(
        '<!-- @MissingComponent -->'
    )
    expect(() => createPresentationJson({}, markdown)).toThrow('MissingComponent invalid')
})

test('respects clear keyword', () => {

    const markdown = lines(
        'Basic',
        '<!-- @Boundary -->',
        'Title',
        '<!-- @Boundary clear skip -->',
        'Clear Title'
    )

    const content = createPresentationJson({ Boundary }, markdown)

    expect(content).toEqual([
        {
            component: nil,
            clear: true,
            markdown: 'Basic'
        },
        {
            component: 'Boundary',
            clear: false,
            markdown: 'Title'
        },
        {
            component: 'Boundary',
            clear: true,
            markdown: 'Clear Title'
        }
    ])
})