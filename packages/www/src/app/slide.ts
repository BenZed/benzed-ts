import { Module, Command } from '@benzed/app'

//// Main ////

export class Slide extends Module {

    value = 0

    readonly get = Command.get(() => this.value)

    readonly set = Command.post((slide: number) => {
        this.value = slide
    })

}
