
import { it } from '@jest/globals'
import { Module } from './module'

import Node from './node'

//// Tests ////

it('sets a node', () => {

    const n1 = Node.create()

    const n2 = n1.setNode('cake', Node.create())

    const n3 = n2.setNode('card', Node.create())

    const n4 = n3.setNode('card', n => n.setNode('hey', Node.create()))
    const n5 = n4.setNode('card', n => n.setNode('hey', n => n.setNode('yo', Node.create())))

    const n6 = n5.removeNode('cake')

    const n7 = n6.addModules(new Module('ace' as const))

    const n8 = n7.setModule(0, m => m)
})
