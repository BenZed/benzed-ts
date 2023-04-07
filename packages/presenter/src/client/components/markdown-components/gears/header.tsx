import React from 'react'

import { Header, Flex, Text, Divider, ActionIcon } from '@mantine/core'
import { IconNotification, IconSettings, IconLogout } from '@tabler/icons-react'

//// Gears Icon ////

const GearsIcon = () => 
    <ActionIcon radius='xl' color='primary' variant='filled'>
        <IconSettings size='1em' />
    </ActionIcon>

const LogoutIcon = () => 
    <ActionIcon radius='xl' color='orange' variant='filled'>
        <IconLogout size='0.95em' />
    </ActionIcon>

const NotificationsIcon = () => 
    <ActionIcon radius='xl' color='green' variant='filled'>
        <IconNotification size='0.95em' />
    </ActionIcon>

//// GearsHeader Component ////

const GearsHeader = () => {

    return <Header height={60}>
        <Flex p='sm' align='center' gap='sm'>

            <GearsIcon/>
            <Text fz='lg' fw='bolder'>Global Mechanic Gears</Text>

            <Divider orientation='vertical' ml='auto'/>

            <NotificationsIcon />
            <LogoutIcon/>
        </Flex>
    </Header>
}

//// Exports ////

export {
    GearsHeader,
    GearsIcon
}