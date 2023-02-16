import { nil } from '@benzed/util'
import { Module } from './module'

//// Main ////

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