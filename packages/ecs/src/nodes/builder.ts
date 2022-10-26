import { Component } from "../component"
import { Node } from "../node"

/* eslint-disable 
    @typescript-eslint/no-explicit-any,
*/

/*** Example ***/

type Modules = readonly Module<any>[]

abstract class Module<M extends Modules> {

    readonly modules: M

    constructor(
        ...modules: M
    ) { 
        this.modules = modules
    }

}

/*** Example ***/

class AppModule<M extends Modules> extends Module<M> {

    add<Mx extends Module<any>>(child: Mx): AppModule<[...M, Mx]> {
        return new AppModule(...this.modules, child)
    }

}