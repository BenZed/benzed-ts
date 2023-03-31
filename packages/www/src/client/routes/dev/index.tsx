import React from 'react'
import { RouteObject } from 'react-router-dom'
import { IsTs } from './is-ts'

//// Exports ////

export * from './dev-page'

export default [
    {
        path: 'is-ts',
        element: <IsTs/>
    }
] satisfies RouteObject[]