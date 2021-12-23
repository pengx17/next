import { TLDotShape } from './TLDotShape'

describe('A minimal test', () => {
  it('Creates an extended shape', () => {
    class TestDot extends TLDotShape {
      defaultProps = {
        radius: 4,
      }
      test() {
        this.update({
          radius: 5,
        })
      }
    }
    const shape = new TestDot({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'dot',
    })
    expect(shape).toBeDefined()
  })

  it('Creates an extended shape with custom props', () => {
    class TestDot extends TLDotShape<{ custom: string }> {
      defaultProps = {
        radius: 4,
        custom: 'foo',
      }
      test() {
        this.update({
          radius: 6,
          custom: 'bar',
        })
      }
    }
    const shape = new TestDot({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'dot',
      custom: 'baz',
    })
    expect(shape).toBeDefined()
  })
})
