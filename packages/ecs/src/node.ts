import Entity, { EntityF, Input, Output } from './entity'

/*** Eslint ***/

/* eslint-disable 
    @typescript-eslint/no-non-null-assertion,
    @typescript-eslint/no-explicit-any
*/

/*** Node ***/

type Links = readonly string[]

type NodeInput<E extends Entity, R extends Entity<Output<E>>> = {
    input: Input<E>
    refs: R[]
}

type NodeOutput<E extends Entity, R extends Entity<Output<E>>> = {
    output: Output<E>
    next: R | null
}

type NodeTransfer<E extends Entity, R extends Entity<Output<E>>> = (
    refs: R[], 
    input: Input<E>, 
    output: Output<E>
) => R | null

type ToEntity<E extends Entity | EntityF> = E extends EntityF<infer I, infer O>
    ? Entity<I,O>
    : E

class Node<
    E extends Entity = Entity<any,any>, 
    L extends Links = Links,
    R extends Entity<Output<E>> = Entity<Output<E>>
> extends Entity<NodeInput<E,R>, NodeOutput<E,R>>{

    public static create<
        E1 extends Entity | EntityF, 
        R1 extends Entity<Output<ToEntity<E1>>
        > = Entity<Output<ToEntity<E1>>>>
    (
        entity: E1,
        transfer: NodeTransfer<ToEntity<E1>, R1>
    ): Node<ToEntity<E1>, [], R1> {

        const e = (
            typeof entity === 'function'  
                ? { execute: entity } 
                : entity
        ) as ToEntity<E1>

        return new Node(e, [], transfer) as Node<ToEntity<E1>, [], R1>
    }

    private constructor(
        public readonly entity: E,
        public readonly links: L,
        public readonly transfer: NodeTransfer<E,R>,
    ) {
        super()
    }

    public execute (ctx: NodeInput<E, R>): NodeOutput<E, R> {

        const { input } = ctx
        
        const output = this.entity.execute(ctx.input) as Output<E>

        const next = this.transfer(ctx.refs, input, output)

        return {
            output,
            next
        }
    }

    public addLink<L1 extends string>(link: L1): Node<E, [...L, L1], R> {

        const { entity, links, transfer } = this

        return new Node(
            entity,
            [...links, link], 
            transfer
        )
    }

}

/*** Exports ***/

export default Node 

export {
    Node,
    NodeInput,
    NodeOutput,

    Links
}