
import { extendable } from './extendable'

it('creates an extendable function', () => {
    
    const walk = extendable(
        function move(this: { speed: number }): number {
            return this.speed
        }, {
            speed: 1
        })

    expect(walk()).toEqual(1)
    expect(walk.speed).toEqual(1)

    const run = walk.extend({ speed: 2 })
    expect(run()).toEqual(2)
    expect(run.speed).toEqual(2)

    const sprint = run.extend({
        speed: 5, 
        getSpeed(this: { speed: number }) {
            return this.speed
        }
    })

    expect(sprint.getSpeed()).toEqual(sprint())
})