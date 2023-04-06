import { between } from '@benzed/string'

//// Exports ////

export function markdownToJson<T extends object = object>(markdown: string): T {

    const jsonString = between(
        markdown.trim(),
        '```json',
        '```'
    )

    const json = JSON.parse(jsonString)
    return json
}