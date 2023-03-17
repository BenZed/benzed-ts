import { Module, Command } from '@benzed/app'

//// Main ////

export class Slide extends Module {

    value = 0 

    readonly get = Command.get(function (this: Module) {
        return (this.parent as Slide).value
    })

    readonly set = Command.post(function (this: Module, slide: number){
        (this.parent as Slide).value = slide
    })

}