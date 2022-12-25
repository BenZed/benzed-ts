
import { it } from '@jest/globals'
import { Module } from './module'

import Node from './node'

//// Tests ////

it('sets a node', () => {

    const n1 = new Node()

    const n2 = n1.setNode('cake', new Node())

    const n3 = n2.setNode('card', new Node())

    const n4 = n3.setNode('card', n => n.setNode('hey', new Node()))
    const n5 = n4.setNode('card', n => n.setNode('hey', n => n.setNode('yo', new Node())))

    const n6 = n5.removeNode('cake')

    const n7 = n6.addModules(new Module('ace'))
})
