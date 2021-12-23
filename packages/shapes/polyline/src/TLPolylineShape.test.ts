import { TLPolylineShape } from './TLPolylineShape'

describe('A minimal test', () => {
  it('Creates an extended shape', () => {
    class TestShape extends TLPolylineShape {
      defaultProps = {
        handles: [],
      }
      test() {
        this.update({
          handles: [],
        })
      }
    }
    const shape = new TestShape({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'dot',
    })
    expect(shape).toBeDefined()
  })

  it('Creates an extended shape with custom props', () => {
    class TestShape extends TLPolylineShape<{ custom: string }> {
      defaultProps = {
        handles: [],
        custom: 'foo',
      }
      test() {
        this.update({
          handles: [],
          custom: 'bar',
        })
      }
    }
    const shape = new TestShape({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'dot',
      custom: 'baz',
    })
    expect(shape).toBeDefined()
  })
})
