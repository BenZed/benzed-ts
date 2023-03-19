import { Module, Command } from '@benzed/app'
import { isTruthy as isNotEmpty } from '@benzed/util'
import fs from '@benzed/fs'

import path from 'path'

//// Constants ////

const SLIDE_BOUNDARY = '<!-- Slide Boundary -->'

//// Main ////

export class Presentation extends Module {

    currentSlide = 0

    readonly getSlides = Command.get(async function () {

        const markdownUrl = path.resolve(__dirname, './presentation.md')
        const markdown = await fs.readFile(markdownUrl, 'utf-8')

        const slides = markdown.split(SLIDE_BOUNDARY).filter(isNotEmpty)
        return slides
    })

    readonly getCurrentSlide = Command.get(function (this: Module) {
        return (this.parent as Presentation).currentSlide
    })

    readonly setCurrentSlide = Command.post(function (this: Module, number: number){
        (this.parent as Presentation).currentSlide = number
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