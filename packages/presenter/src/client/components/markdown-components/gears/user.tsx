import React from 'react'

import { Flex, Text, Avatar, ActionIcon } from '@mantine/core'
import { IconChevronRight } from '@tabler/icons-react'

//// GearsHeader Component ////

const GearsUser = () =>

    <Flex gap='xs' align='center'>

        <Avatar src='/assets/chris-brodie.jpg' radius='xl' size='md'/>

        <Flex direction='column'>
            <Text size='sm'>Chris Brodie</Text>
            <Text fs='italic' size='xs' c='dimmed'>
                brodie@globalmechanic.com
            </Text>
        </Flex>

        <ActionIcon color='primary'>
            <IconChevronRight />
        </ActionIcon>

    </Flex>

//// Exports ////

export { GearsUser }