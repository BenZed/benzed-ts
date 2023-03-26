import fs from '@benzed/fs'
import { IS_DEV } from '@benzed/util'
import { Module, Command } from '@benzed/app'

import path from 'path'

import {
    createPresentationJson,
    PresentationJson
} from './create-presentation-json'

import { MarkdownComponentMap } from './markdown-component'

//// Main ////

export class PresentationModule<P extends MarkdownComponentMap> extends Module {

    constructor(
        private readonly _components: P,
        private readonly _markdownDirectory: string
    ) {
        super()
    }

    private readonly _presentationJson: PresentationJson<P>[] = []

    readonly getPresentationJson = Command.get(async function (this: Module) {
        const parent = this.parent as PresentationModule<P>
        if (IS_DEV || parent._presentationJson.length === 0) {

            const markdowns = await readMarkdown(parent._markdownDirectory)

            const json = markdowns
                .map(({ markdown }) => createPresentationJson(parent._components, markdown))
                .flat()

            parent._presentationJson.length = 0
            parent._presentationJson.push(...json)
        }
        return parent._presentationJson
    })

    currentIndex = 0

    readonly getCurrentIndex = Command.get(function (this: Module) {
        const parent = this.parent as PresentationModule<P>
        return parent.currentIndex
    })

    readonly setCurrentIndex = Command.post(function (this: Module, current: number) {
        const parent = this.parent as PresentationModule<P>
        parent.currentIndex = current
    })

}

//// Helper ////

async function readMarkdown(markdownDirectory: string ): Promise<{ name: string, markdown: string }[]> {

    const markdownUrls = await fs.readDir(markdownDirectory, {
        filter(url) {
            return url.endsWith('.md')
        },
        asUrls: true
    })
    const markdowns: { name: string, markdown: string }[] = []

    for (const markdownUrl of markdownUrls) {

        const name = path.basename(markdownUrl, '.md')

        const markdown = await fs.readFile(markdownUrl, 'utf-8')
        markdowns.push({ name, markdown })
    }

    return markdowns
}

