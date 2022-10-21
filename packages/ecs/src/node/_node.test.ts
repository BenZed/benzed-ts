import $ from '@benzed/schema'

import { Component, isComponent, } from '../component'
import { Node } from './node'

import * as transfer from './transfers'
import { TransferContext } from './_node'

class Parser extends Node<string, number> {

    compute = parseFloat

    canCompute = $.string.is

    transfer = transfer.switcher<number>()

}

class Inverter extends Node<boolean, boolean> {
    compute = (i: boolean): boolean => !i
    canCompute = $.boolean.is 
    transfer = transfer.switcher<boolean>()
}

it('is simply a component with node oriented i/o', () => {

    const parse = new Parser() 

    expect(parse.compute('100'))
        .toEqual(100)

    expect(isComponent(parse)).toEqual(true)

})

/**
 * At the most basic level, nodes should only be able to 
 * target components that take it's output as input
 */
it('type safe targets', () => {

    const parseNode = new Parser() 

    parseNode.transfer({
        input: '50',
        output: 50,
        // @ts-expect-error Disallowed Target
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

    class TrafficLightComponent<L extends Light> 
        extends Component<IntersectionData, IntersectionData> {

        compute(input: IntersectionData): IntersectionData {
            return {
                ...input
            }
        }
        
        canCompute = $.shape({
            idleCars: $.number,
            idlePedestrians: $.number
        }).is
        
        constructor(
            public light: L
        ){
            super() 
        }
    }

    class TrafficNode extends 
        Node<IntersectionData, IntersectionData, TrafficLightComponent<Light>> {

        compute(input: IntersectionData): IntersectionData {
            return {
                ...input
            }
        }

        canCompute(value: unknown): value is IntersectionData {
            return typeof value === 'object'
        }

        transfer(
            {
                input,
                targets
            }: TransferContext<IntersectionData, IntersectionData, TrafficLightComponent<Light>>
        ): TrafficLightComponent<Light> | null {

            const light = input.idlePedestrians > input.idleCars ? 'stop' : 'go'

            const target = targets.find(t => t.light === light) ?? targets[0] ?? null
            return target

        }
    }

    const traffic = new TrafficNode()

    const input = { idleCars: 0, idlePedestrians: 10 }
    const output = traffic.compute(input)

    const target = traffic.transfer({
        input,
        output,
        targets: [
            new TrafficLightComponent('go'),
            new TrafficLightComponent('stop'),
        ]
    })

    expect(target?.light).toEqual('stop')

    traffic.transfer({
        input,
        output,
        targets: [
            // @ts-expect-error Taking intersection data isn't enough. This node
            // needs to target components with a 'light' property.
            { execute: (i: IntersectionData) => i }
        ]
    })

})
