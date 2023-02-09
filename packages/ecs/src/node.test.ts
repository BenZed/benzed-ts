import { nil, pick } from '@benzed/util'
import { $$state, applyState, copy } from '@benzed/immutable'

import { test } from '@jest/globals'

import { Node } from './node'

import { Module, getChildren, getParent } from './module'

//// Setup ////

class Collection extends Module {

    readonly ace: number = 0

    get [$$state](): { ace: number } {
        return pick(this, 'ace')
    }

}

class Service extends Node {

    readonly collection = new Collection()

}

const app = new class App extends Node {

    readonly users = new Service()

}

//// Tests ////

for (const a of [
    app,
    copy(app),
    applyState(app, 'users', 'collection', 'ace', 10),
]) {

    describe(a === app ? 'original' : 'copy', () => {

        test('children', () => {
            expect(getChildren(a))  
                .toEqual({ users: a.users })
        })

        test('parent', () => {
            expect(getParent(a.users) === a).toBe(true)
        })

        test('nested parent', () => {
            expect(getParent(a.users.collection) === a.users).toBe(true)

        })

        test('root parent', () => {  
            expect(getParent(a)).toBe(nil)
        })

    })

}
