import { Component, InputOf, isComponent, OutputOf } from '../component'
import { NodeComponent, NodeInput, NodeOutput } from './node-component'
import { expectTypeOf } from 'expect-type'

class Parser extends NodeComponent<string, number> {
    public execute({ input, targets }: NodeInput<string, number>): NodeOutput<number> {
        return {
            output: parseInt(input),
            target: [...targets].at(0) ?? null
        }
    }
}

class Inverter extends Component<boolean, boolean> {
    public execute(input: boolean): boolean {
        return !input
    }
}

it('is simply a component with node oriented i/o', () => {

    const parse = new Parser()

    expect(parse.execute({ input: '100', targets: [] }))
        .toEqual({ output: 100, target: null })

    expect(isComponent(parse)).toEqual(true)

})

/**
 * At the most basic level, nodes should only be able to 
 * target components that take it's output as input
 */
it('type safe targets', () => {

    const parseNode = new Parser()

    parseNode.execute({
        input: '50',
        // @ts-expect-error boolean !== number
        targets: [ new Inverter() ]
    })

})

/**
 * Nodes can also enforce higher restrictions on the nodes they can transfer to
 */
it('explicit target discrimination', () => {

    interface IntersectionData {
        idleCars: number
        idlePedestrians: number
    }    

    type Light = 'go' | 'stop'

    interface TrafficLightComponent<L extends Light> 
        extends Component<IntersectionData, IntersectionData> {
        light: L
    }

    class TrafficNode extends 
        NodeComponent<IntersectionData, IntersectionData, TrafficLightComponent<Light>> {

        public execute(
            {
                input,
                targets
            }: NodeInput<IntersectionData, IntersectionData, TrafficLightComponent<Light>>
        ): NodeOutput<IntersectionData, TrafficLightComponent<Light>> {

            const light = input.idlePedestrians > input.idleCars ? 'stop' : 'go'

            const target = targets.find(t => t.light === light) ?? targets[0] ?? null

            return {
                output: input,
                target
            }
        }
    }

    const traffic = new TrafficNode()

    const { target } = traffic.execute({
        input: { idleCars: 0, idlePedestrians: 10 },
        targets: [
            { light: 'go', execute: i => i },
            { light: 'stop', execute: i => i}
        ]
    })

    expect(target?.light).toEqual('stop')

    traffic.execute({
        input: { idleCars: 100, idlePedestrians: 50 },
        targets: [
            // @ts-expect-error Taking intersection data isn't enough. This node
            // needs to target components with a 'light' property.
            { execute: (i: IntersectionData) => i }
        ]
    })
})

it('inferred i/o', () => {

    type MathNode = NodeComponent<[number, number], number>

    expectTypeOf<InputOf<MathNode>>().toEqualTypeOf<NodeInput<[number,number]>>()
    expectTypeOf<OutputOf<MathNode>>().toEqualTypeOf<NodeOutput<number>>()

})