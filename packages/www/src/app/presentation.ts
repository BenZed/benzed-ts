import { IS_DEV, Mutable } from '@benzed/util'
import { Module, Command } from '@benzed/app'
import fs from '@benzed/fs'

import path from 'path'
import is, { ReadOnly, Or, Optional } from '@benzed/is'

//// Type ////

export const isContentCard = is({
    prompt: is.string.readonly,
    content: is.string.readonly
})

export type ContentCard = typeof isContentCard.output

export const isSlide = is.readonly({
    title: is.string,
    cards: is.readonly.arrayOf(isContentCard)
})

export type Slide = typeof isSlide.output

export const isPresentationState = is.readonly({
    slide: is.number.min(0),
    card: is.number.min(0)
})

export type PresentationState = typeof isPresentationState.output

//// Main ////

export class Presentation extends Module {

    current = { slide: 0, card: 0 }

    private _slides: Slide[] = []

    readonly getSlides = Command.get(async function (this: Module) {

        const parent = this.parent as Presentation
        if (IS_DEV || parent._slides.length === 0) {
            const markdown = await readMarkdown()
            parent._slides = markdown.map(createSlides).flat()
        }

        return parent._slides
    })

    readonly getCurrent = Command.get(function (this: Module) {

        const parent = this.parent as Presentation
        return parent.current
    })

    readonly setCurrent = Command.post(function (this: Module, slideState: PresentationState){
        
        const parent = this.parent as Presentation

        parent.current = slideState
    })

    // Future decorator syntax

    // @command.get() 
    // getSlides() {
    // 
    // }

    // @command.get()
    // getCurrent() {
    //     return this.value
    // }

    // @command.post(is.number)
    // setCurrent(slide: number) {
    //     this.value = slide
    // }

    // Contrived examples
    // @command.post({ x: is.number, y: is.number }).path`position/${'x'}/${'y'}`.headers(authHeaders)
    // createPosition(position: Vector) { this.positions.push(position) }
    // @command.put(isVector).path`position`.headers(authHeaders)
    // setPosition(position){ this.positions[0] = position }
    // @command.get().path`position`.headers(authHeaders)
    // getPosition() { return this.positions[0] }
}

//// Helper ////

async function readMarkdown(): Promise<{ name: string, contents: string }[]> {

    const MARKDOWN_DIR = path.resolve(__dirname, './presentation')

    const markdownUrls = await fs.readDir(MARKDOWN_DIR, {
        filter(url) {
            return url.endsWith('.md')
        },
        asUrls: true
    })
    const markdown: { name: string, contents: string }[] = []

    for (const markdownUrl of markdownUrls) {
        const name = path.basename(markdownUrl, '.md')
        const contents = await fs.readFile(markdownUrl, 'utf-8')

        markdown.push({ name, contents })
    }
    return markdown
}

function createSlides(markdown: { name: string, contents: string }): Slide[] {

    const CARD_BOUNDARY = /^>\s/
    const SLIDE_BOUNDARY = /^##?\s/

    const fileTitle = markdown
        .name
        .replace(/^(\d+-?)/, '') // "01-title" -> "title"

    const slides: Slide[] = []

    // create slides
    for (const line of markdown.contents.split('\n')) {

        const hasAtLeastOneSlide = slides.length > 0

        const isSlideBoundary = SLIDE_BOUNDARY.test(line)
        if (isSlideBoundary || !hasAtLeastOneSlide)
            slides.push({ title: fileTitle, cards: [] })

        const slide = slides.at(-1) as Mutable<Slide>
        if (isSlideBoundary) {
            const title = line.replace(SLIDE_BOUNDARY, '')
            slide.title = title
            slide.cards.push({ prompt: title, content: '' })
            continue
        }

        const isCardBoundary = CARD_BOUNDARY.test(line)
        if (isCardBoundary) {
            const prompt = line.replace(CARD_BOUNDARY, '')
            slide.cards.push({ prompt, content: '' })
        } else {
            // append card content
            const lastCardIndex = slide.cards.length - 1
            slide.cards[lastCardIndex].content += line + '\n'
        }
    }

    return slides
}
