import React, { ReactElement, ReactNode } from 'react'

import { Center, Flex, Avatar, Title, TitleProps, NavLink } from '@mantine/core'

import { benAvatar } from '../../assets'

//// BenGaumond Component ////

const BenGaumond = (props: TitleProps) => 
    <Flex align='center' gap='lg'>
        <Avatar
            size='min(10vw, 10em)'
            src={benAvatar}
            radius='50%'
        />

        <Title 
            inline
            size='min(5vw, 7em)'
            sx={{
                fontFamily: 'Libby'
            }}
            {...props}
        >
            bengaumond.com
        </Title>
    </Flex>

//// HomePage Component ////

interface HomePageProps {
    children?: ReactNode
}

const HomePage = (props: HomePageProps): ReactElement => {
    const {} = props
    
    return <Center h='100vh' w='100vw'>
        <Flex direction='column'>
            <BenGaumond />
        </Flex>
    </Center>
}

//// Exports ////

export default HomePage

export {
    HomePage,
    HomePageProps
}