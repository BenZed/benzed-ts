import { isTruthy as isNotEmpty, IS_DEV, toVoid } from '@benzed/util'
import { Module, Command } from '@benzed/app'
import { clamp } from '@benzed/math'
import fs from '@benzed/fs'
import is from '@benzed/is'

import path from 'path'
import os from 'os'

//// Type ////

export interface Slide {

    readonly title: string

    /**
     * Content visible to attendees
     */
    readonly content: string

    /**
     * Dialog cards visible to the presenter only
     */
    readonly cards: readonly string[]

}

//// Main ////

export class Presentation extends Module {

    currentSlide = 0

    private _slides: Slide[] = []
    readonly getSlides = Command.get(async function (this: Module) {

        const parent = this.parent as Presentation
        if (parent._slides.length === 0) {
            const markdown = await readMarkdown()
            parent._slides = markdown.map(createSlides).flat()
        }

        return parent._slides
    })

    readonly getCurrentSlide = Command.get(async function (this: Module) {

        const parent = this.parent as Presentation

        const current = IS_DEV 
            ? await getDevCurrentSlide(parent)
            : parent.currentSlide

        return current
    })

    readonly setCurrentSlide = Command.post(async function (this: Module, nextSlide: number){
        
        const parent = this.parent as Presentation

        nextSlide = clamp(nextSlide, 0, parent._slides.length)

        if (IS_DEV)
            await setDevCurrentSlide(parent, nextSlide)
        else 
            parent.currentSlide = nextSlide
    })

    // Future decorator syntax

    // @Command.get() 
    // getSlides() {
    // 
    // }

    // @Command.get()
    // getCurrent() {
    //     return this.value
    // }

    // @Command.post(is.number)
    // setCurrent(slide: number) {
    //     this.value = slide
    // }

    // Contrived examples
    // @Command.post({ x: is.number, y: is.number }).path`position/${'x'}/${'y'}`.headers(authHeaders)
    // createPosition(position: Vector) { this.positions.push(position) }
    // @Command.put(isVector).path`position`.headers(authHeaders)
    // setPosition(position){ this.positions[0] = position }
    // @Command.get().path`position`.headers(authHeaders)
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

    const SLIDE_BOUNDARY = '<!-- Slide Boundary -->'
    const PRESENTER_CARD_PREFIX = '> '
    const TITLE_PREFIX = '# '

    const rawSlides = markdown
        .contents
        .split(SLIDE_BOUNDARY)
        .filter(isNotEmpty)

    let title = markdown.name

    // create slides
    const slides = rawSlides.map(rawSlide => {

        const lines = rawSlide.split('\n')

        if (lines[0].includes(TITLE_PREFIX))
            title = lines.shift()?.replace(TITLE_PREFIX, '').trim() ?? title

        // For a given slide, we're treating any markdown block quote
        // as a presenter card that should be visible to the presenter only.
        const cards = lines
            .filter(line => line.startsWith(PRESENTER_CARD_PREFIX))
            .map(quote => quote.replace(PRESENTER_CARD_PREFIX, ''))

        // Anything that isn't a block quote is content that should be
        // visible to the attendees
        const content = lines
            .filter(line => !line.startsWith(PRESENTER_CARD_PREFIX))
            .join('\n')

        return {
            title,
            content,
            cards
        }
    })

    return slides
}

//// Dev Helper ////

const DEV_STATE_FILE_NAME = `bz-www-presentation-dev-state`

async function getDevCurrentSlide(presentation: Presentation): Promise<number> {

    const devStateUrl = path.join(os.tmpdir(), DEV_STATE_FILE_NAME)

    const isDevState = is.shape({ currentSlide: is.number })

    const devState = await fs
        .readJson(devStateUrl, isDevState.assert)
        .catch(toVoid)

    return (devState ?? presentation).currentSlide
}

async function setDevCurrentSlide(presentation: Presentation, currentSlide: number): Promise<void> {

    const devStateUrl = path.join(os.tmpdir(), DEV_STATE_FILE_NAME)

    presentation.currentSlide = currentSlide

    await fs
        .writeJson({ currentSlide }, devStateUrl)
        .catch(toVoid)

}