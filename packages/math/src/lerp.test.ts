import lerp from './lerp'

describe('lerp()', () => {

  it('lerps a value from $from $to to by $delta: \tlerp(5,10,0.5) === 7.5', () => {
    expect(lerp(5, 10, 0.5)).toEqual(7.5)
  })

  it('works from hi to low: \t\t\t\tlerp(6,2,0.25) === 5', () => {
    expect(lerp(6, 2, 0.25)).toEqual(5)
  })

  it('works on negative values: \t\t\tlerp(0, -10, 0.1) === -1', () => {
    expect(lerp(0, -10, 0.1)).toEqual(-1)
  })

  it('$delta is unclamped: \t\t\t\tlerp(-10, 10, 1.5) === 20', () => {
    expect(lerp(-10, 10, 1.5)).toEqual(20)
  })

})
