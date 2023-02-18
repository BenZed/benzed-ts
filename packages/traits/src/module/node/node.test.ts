import { test } from '@jest/globals'

import { nil, pick } from '@benzed/util'

import { $$state, applyState } from '../state'
import { Module, getChildren, getParent } from '../module'
import { copy } from '../copy'
import { Node } from './node'

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

for (const appOrCopy of [
    app,
    copy(app),
    applyState(app, 'users', 'collection', 'ace', 10),
]) {
    describe(appOrCopy === app ? 'original' : 'copy', () => {

        test('children', () => {
            expect(getChildren(appOrCopy))
                .toEqual({ users: appOrCopy.users })
        })

        test('parent', () => {
            expect(getParent(appOrCopy.users) === appOrCopy).toBe(true)
        })

        test('nested parent', () => {
            expect(getParent(appOrCopy.users.collection) === appOrCopy.users).toBe(true)
        })

        test('root parent', () => {
            expect(getParent(appOrCopy)).toBe(nil)
        })
    })
}
