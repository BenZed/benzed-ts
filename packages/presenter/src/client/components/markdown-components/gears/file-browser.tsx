import React, { ReactElement, ReactNode } from 'react'

import { List, Text, ThemeIcon, ThemeIconProps } from '@mantine/core'

import { 
    IconCamera, 
    IconFile,
    IconFolder, 
    IconFolders, 
    IconPdf,
    IconSettings, 
    IconTxt, 
    IconVideo, 
    TablerIconsProps 
} from '@tabler/icons-react'

import { nil } from '@benzed/util'

//// EsLint ////

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

//// Types ////

type GearsFileBrowserProps = GearsFolder

type GearsFolder = {
    type: 'folder'
    name: string
    contents: (GearsFolder | GearsFile)[]
    open?: boolean
    template?: { name: string, state?: 'changes' | 'checked-out' }
} 

type GearsFile = {
    type: 'file'
    name: string
    ext: string
}

//// Helper Components ////

type FsIconProps = Omit<ThemeIconProps, 'children'>

const FileIcon = ({ Icon = IconFile, ...rest }: FsIconProps & { Icon?: (props: TablerIconsProps) => ReactElement }) =>
    <ThemeIcon radius='lg' variant='light' {...rest}>
        <Icon size='0.85em' />
    </ThemeIcon>

const FolderIcon = (props: FsIconProps & { open: boolean }) => {

    const { open, ...rest } = props

    return <ThemeIcon radius='lg' variant='light' {...rest}>
        {open 
            ? <IconFolders size='1em' />
            : <IconFolder size='0.8em' />
        }
    </ThemeIcon>
}

const Entry = (props: { children?: ReactNode, icon: ReactElement }) => {
    
    const { icon, children } = props

    return <List.Item icon={icon}>{children}</List.Item>
}

const Folder = (props: GearsFolder) => {

    const { name, open = true } = props

    const icon = <FolderIcon open={open} />

    return <Entry icon={icon} >

        <Text size='sm'>{name}</Text>

        {
            open
                ? <List>
                    {props.contents.map((c, i) => c.type === 'folder' 
                        ? <Folder key={i} {...c}/>
                        : <File key={i} {...c}/>
                    )}
                </List>
                : null
        }

    </Entry>
}

const File = (props: GearsFile) => {

    const { name, ext } = props

    const isGearsJson = name === 'gears' && ext === 'json'

    const Icon = isGearsJson ? IconSettings
        : {
            'mov': IconVideo,
            'png': IconCamera,
            'pdf': IconPdf,
            'txt': IconTxt
        }[ext]

    const icon = <FileIcon
        Icon={Icon}
        color={isGearsJson ? 'orange' : nil}
        variant={isGearsJson ? 'outline' : 'light'}
    />

    const fontWeight = isGearsJson ? 'bold' : undefined

    return <Entry icon={icon}>
        <Text size='sm' fw={fontWeight}>{name}.{ext}</Text>
    </Entry>
}

//// FileBrowser Component ////

const GearsFileBrowser = (props: GearsFileBrowserProps): ReactElement =>    
    <List>
        <Folder {...props} />
    </List>

//// Exports ////

export {
    GearsFileBrowser,
    GearsFileBrowserProps
}