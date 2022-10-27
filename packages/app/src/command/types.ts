type Action = 'get' | 'create' | 'update' | 'remove'

export interface Command {
    name: `${Action}-${string}`
}

type _Command = {
    action: `get`
    id: string
} | {
    action: `create`
    data: object
} | {
    action: `update`
    id: string 
    data: object
} | {
    action: `remove`
    id: string
}

export interface CommandResult {
    name: string
}