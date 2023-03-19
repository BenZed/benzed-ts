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

    // Future decorator syntax
    // @Command.get()
    // get() {
    //     return this.value
    // }

    // @Command.post(is.number)
    // set(slide: number) {
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