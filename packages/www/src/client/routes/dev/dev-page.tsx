import React, { ReactElement } from 'react'

import {
    Container
} from '@mantine/core'

import { Link, Outlet } from 'react-router-dom'

//// HomePage Component ////

interface DevPageProps {}

const DevPage = (props: DevPageProps): ReactElement => {

    const { } = props

    return <Container>
        <Link to='is-ts'>is-ts</Link>
        <Outlet/>
    </Container>
}

//// Exports ////

export default DevPage

export {
    DevPage,
    DevPageProps
}