import React, { ReactElement } from 'react'

import { Navbar, AppShell} from '@mantine/core'

import { markdownToJson } from './markdown-to-json'

import { GearsFileBrowser, GearsFileBrowserProps } from './file-browser'
import { GearsNavigation } from './navigation'
import { GearsHeader } from './header'
import { GearsUser } from './user'

import { MarkdownComponentProps } from '../../presentation'

//// Folder Component ////

type GearsMockJson = [ { endpoint: 'file-browser' }, GearsFileBrowserProps ]

//// Endpoints ////

const ENDPOINTS = {
    'file-browser': GearsFileBrowser
}

//// Mock Gears Component ////

const Gears = ({ markdown }: MarkdownComponentProps): ReactElement => {

    const [ nav, props ] = markdownToJson<GearsMockJson>(markdown)

    const EndPoint = ENDPOINTS[nav.endpoint]
 
    return <AppShell

        navbar={

            <Navbar width={{ base: 300 }} p='xs'>

                <Navbar.Section>
                    <GearsHeader />
                </Navbar.Section>

                <Navbar.Section grow>
                    <GearsNavigation {...nav} />
                </Navbar.Section>

                <Navbar.Section p='sm'>
                    <GearsUser />
                </Navbar.Section>

            </Navbar>
        }
    >
        <EndPoint {...props} />
    </AppShell>
}

//// Exports ////

export default Gears

export {
    Gears,
}