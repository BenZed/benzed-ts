import { Component, InputOf } from './component'
/*** Lint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/***  ***/

abstract class ComplexComponent<I,O,S extends object> {
    
    public abstract execute(i: I): O 

    public constructor(public settings: S) {}

}

/***  ***/

class X10 extends ComplexComponent<number, number, {}> {

    public execute(i: number): number {
        return i * 10
    }

}

type Executable<C extends Component<any,any>> = { execute: C }

const x10: Executable<Component<number, number>> = new X10({})

/***  ***/

abstract class NodeComponent<I,O,T = unknown> extends ComplexComponent<I,O, {}> {

    public abstract transfer(ctx: {
        input: I
        output: O
        source: Component<I,O>
        targets: T[]
    }): T | null

}

/*** Exports ***/
