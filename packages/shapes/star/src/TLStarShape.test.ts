import { TLStarShape } from './TLStarShape'

describe('A minimal test', () => {
  it('Creates an extended shape', () => {
    class TestShape extends TLStarShape {
      defaultProps = {
        sides: 5,
        ratio: 0.5,
        isFlippedY: false,
        size: [100, 100],
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
      type: 'polygon',
    })
    expect(shape).toBeDefined()
  })

  it('Creates an extended shape with custom props', () => {
    class TestShape extends TLStarShape<{ custom: string }> {
      defaultProps = {
        sides: 5,
        ratio: 0.5,
        isFlippedY: false,
        size: [100, 100],
        custom: 'foo',
      }
      test() {
        this.update({
          size: [100, 100],
          custom: 'bar',
        })
      }
    }
    const shape = new TestShape({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'polygon',
      custom: 'baz',
    })
    expect(shape).toBeDefined()
  })
})
