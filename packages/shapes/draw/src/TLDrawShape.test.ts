import { TLDrawShape } from './TLDrawShape'

describe('A minimal test', () => {
  it('Creates an extended shape', () => {
    class TestShape extends TLDrawShape {
      defaultProps = {
        points: [],
        isComplete: false,
      }
      test() {
        this.update({
          isComplete: true,
        })
      }
    }
    const shape = new TestShape({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'draw',
    })
    expect(shape).toBeDefined()
  })

  it('Creates an extended shape with custom props', () => {
    class TestShape extends TLDrawShape<{ custom: string }> {
      defaultProps = {
        points: [],
        isComplete: false,
        custom: 'foo',
      }
      test() {
        this.update({
          isComplete: true,
          custom: 'bar',
        })
      }
    }
    const shape = new TestShape({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'draw',
      custom: 'baz',
    })
    expect(shape).toBeDefined()
  })
})
