
import { NodeTable } from './node-table'
import { it, expect } from '@jest/globals'

import copy from '../copy'

import { Module } from '../module'
import { $$state } from '../state'

//// Setup ////

class Text<S extends string> extends Module {
    constructor(readonly text: S) {
        super()
    }
}

class Switch<B extends boolean> extends Module {
    constructor(readonly boolean: B) {
        super()
    }
}

//// Tests ////

const completed = new Switch(true)
const description = new Text('Finish NodeTable implementation')

const todo = new NodeTable({
    completed: copy(completed),
    description: copy(description)
})

it('construct', () => {
    expect(todo[$$state]).toEqual({
        completed,
        description
    })
})

it('index', () => {
    expect(todo.completed).toEqual(completed)
    expect(todo.description).toEqual(description)
})

describe('interface', () => {

    test('pick', () => {
        const completed = todo(t => t.pick('completed'))
        expect({ ...completed }).toEqual({ completed: todo.completed })
    })

    test('omit', () => {
        const description = todo(t => t.omit('completed'))
        expect({ ...description }).toEqual({ description: todo.description })
    })

    test('merge', () => {
        const off = new Switch(false)
        const plus = todo(t => t.merge({ off }))
        expect({ ...plus }).toEqual({ ...todo, off })
    })

    test.todo('set')

    test.todo('delete')

})