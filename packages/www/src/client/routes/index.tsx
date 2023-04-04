import React from 'react'
import { RouteObject } from 'react-router-dom'

import { HomePage } from './home-page'

import devRoutes, { DevPage } from './dev'
// import editRoutes, { EditorPage } from './dev'
// import filmRoutes, { FilmsPage } from './dev'

//// Exports ////

export default [
    {
        path: '/',
        element: <HomePage />
    },
    {
        path: '/dev',
        element: <DevPage />,
        children: devRoutes
    },
    // {
    //     path: '/edit',
    //     element: <EditorPage />
    // },
    // {
    //     path: '/films',
    //     element: <FilmsPage />
    // }
] satisfies RouteObject[]