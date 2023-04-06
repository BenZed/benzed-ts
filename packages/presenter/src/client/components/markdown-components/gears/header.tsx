import React from 'react'

import { Header, Flex, Text, ThemeIcon } from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'

//// Gears Icon ////

const GearsIcon = () => 
    <ThemeIcon radius='xl'>
        <IconSettings />
    </ThemeIcon>

//// GearsHeader Component ////

const GearsHeader = () => {

    return <Header height={60}>
        <Flex p='sm' align='center' gap='sm'>
            <GearsIcon/>
            <Text fz='lg' fw='bolder'>Gears</Text>
        </Flex>
    </Header>
}

//// Exports ////

export {
    GearsHeader,
    GearsIcon
}