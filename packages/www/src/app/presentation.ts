import { isTruthy as isNotEmpty, IS_DEV, toVoid } from '@benzed/util'
import { Module, Command } from '@benzed/app'
import { clamp } from '@benzed/math'
import fs from '@benzed/fs'
import is from '@benzed/is'

import path from 'path'
import os from 'os'

//// Type ////

export interface Slide {

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
            parent._slides = createSlides(markdown)
        }

        return parent._slides
    })

    readonly getCurrentSlide = Command.get(async function (this: Module) {

        const parent = this.parent as Presentation

        const current = IS_DEV 
            ? await syncDevCurrentSlide(parent)
            : parent.currentSlide

        return current
    })

    readonly setCurrentSlide = Command.post(async function (this: Module, nextSlide: number){
        
        const parent = this.parent as Presentation

        nextSlide = clamp(nextSlide, 0, parent._slides.length)

        if (IS_DEV)
            await syncDevCurrentSlide(parent, nextSlide)
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

async function readMarkdown(): Promise<string> {

    const MARKDOWN_FILE = './presentation.md'

    const markdownUrl = path.resolve(__dirname, MARKDOWN_FILE)
    
    const markdown = await fs.readFile(markdownUrl, 'utf-8')
    return markdown
}

function createSlides(markdown: string): Slide[] {

    const SLIDE_BOUNDARY = '<!-- Slide Boundary -->'
    const PRESENTER_CARD_PREFIX = '> '

    const rawSlides = markdown
        .split(SLIDE_BOUNDARY)
        .filter(isNotEmpty)

    const slides = rawSlides.map(rawSlide => {

        const lines = rawSlide.split('\n')

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
            content,
            cards
        }
    })

    return slides
}

async function syncDevCurrentSlide(presentation: Presentation, newCurrentSlide?: number): Promise<number> {

    const DEV_STATE_URL = path.join(os.tmpdir(), `bz-www-presentation-dev-state`)

    if (is.number(newCurrentSlide)) {

        presentation.currentSlide = newCurrentSlide

        const devState = { 
            currentSlide: presentation.currentSlide 
        }

        await fs
            .writeJson(devState, DEV_STATE_URL)
            .catch(toVoid)
        
        return presentation.currentSlide
    } else {

        const isDevState = is.shape({ currentSlide: is.number })

        const devState = await fs
            .readJson(DEV_STATE_URL, isDevState.assert)
            .catch(toVoid)

        return (devState ?? presentation).currentSlide
    }
}