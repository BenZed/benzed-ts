import Entity, { Input, Output } from './entity'

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

class Node<
    E extends Entity = Entity<unknown,unknown>, 
    L extends Links = Links,
    R extends Entity<Output<E>> = Entity<Output<E>>
> extends Entity<NodeInput<E,R>, NodeOutput<E,R>>{

    public static create<E1 extends Entity, R1 extends Entity<Output<E1>> = Entity<Output<E1>>>(
        entity: E1,
        transfer: NodeTransfer<E1, R1>
    ): Node<E1, [], R1> {
        return new Node(entity, [], transfer)
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