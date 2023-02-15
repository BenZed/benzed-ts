import { pick } from '@benzed/util'

import { NodeTable } from './node-table'

import { it, expect } from '@jest/globals'
import { Module } from '../module'
import { $$state } from '../state'
import copy from '../copy'

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
