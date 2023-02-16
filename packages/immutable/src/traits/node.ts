import { nil } from '@benzed/util'
import { AssertModule, FindModule, HasModule } from '../module'
import { Module } from './module'

//// Main ////

abstract class Find extends Module {

    abstract get find(): FindModule

    abstract get has(): HasModule

    abstract get assert(): AssertModule

}

abstract class Node extends Module {

    abstract get root(): Module

    abstract get parent(): Module | nil

    abstract get children(): Module[]

    abstract get ancestors(): Module[]

    abstract get descendents(): Module[]

}

//// Exports ////

export default Node

export {
    Node
}