import { createNode, defineNode, Node, LinksOf, TargetOf } from './node'

import { Component, InputOf, OutputOf } from './component'

/*** Exports ***/

export {

    Node,
    Component,

    InputOf as EntityInput,
    OutputOf as EntityOutput,

    LinksOf as NodeLinks,
    TargetOf as NodeRef

}