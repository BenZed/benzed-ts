import fs from '@benzed/fs'
import { IS_DEV } from '@benzed/util'
import { Module, Command } from '@benzed/app'

import path from 'path'

import {
    createPresentationJson,
    PresentationJson
} from '../client/components/presentation/create-presentation-json'

import type {
    MarkdownComponentMap
} from '../client/components/presentation'

//// Main ////

/**
 * The presenter module keeps the ui state in sync for viewers
 */
export class Presenter<P extends MarkdownComponentMap> extends Module {

    constructor(
        private readonly _components: P | Promise<P>
    ) {
        super()
    }

    //// Presentation Json ////

    private readonly _presentationJson: PresentationJson<P>[] = []

    readonly getPresentationJson = Command.get(async function (this: Module) {
        const parent = this.parent as Presenter<P>
        if (IS_DEV || parent._presentationJson.length === 0) {

            const markdowns = await readMarkdown()

            const components = await parent._components

            const json = markdowns
                .map(({ markdown }) => createPresentationJson(components, markdown))
                .flat()

            parent._presentationJson.length = 0
            parent._presentationJson.push(...json)
        }
        return parent._presentationJson
    })

    //// Current Index ////

    currentIndex = 0

    readonly getCurrentIndex = Command.get(function (this: Module) {
        const parent = this.parent as Presenter<P>
        return parent.currentIndex
    })

    readonly setCurrentIndex = Command.post(function (this: Module, current: number) {
        const parent = this.parent as Presenter<P>
        parent.currentIndex = current
    })

}

//// Helper ////

async function readMarkdown(): Promise<{ name: string, markdown: string }[]> {

    const MARKDOWN_DIRECTORY = path.join(__dirname, 'markdown')

    const markdownUrls = await fs.readDir(MARKDOWN_DIRECTORY, {
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

