import { TLBoxShape } from './TLBoxShape'

describe('A minimal test', () => {
  it('Creates an extended shape', () => {
    class TestBox extends TLBoxShape {
      defaultProps = {
        size: [100, 100],
      }
      test() {
        this.update({
          size: [100, 100],
        })
      }
    }
    const shape = new TestBox({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'box',
    })
    expect(shape).toBeDefined()
  })

  it('Creates an extended shape with custom props', () => {
    type CustomProps = { custom: string; size: number[] }
    class TestBox extends TLBoxShape<CustomProps> {
      defaultProps: CustomProps = {
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
    const shape = new TestBox({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'box',
      custom: 'baz',
    })
    expect(shape).toBeDefined()
  })
})
