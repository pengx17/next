import { TLLineShape } from './TLLineShape'

describe('A minimal test', () => {
  it('Creates an extended shape', () => {
    class TestShape extends TLLineShape {
      defaultProps = {
        handles: [
          {
            id: 'start',
            point: [0, 0],
          },
          {
            id: 'end',
            point: [0, 0],
          },
        ],
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
      type: 'line',
    })
    expect(shape).toBeDefined()
  })

  it('Creates an extended shape with custom props', () => {
    class TestShape extends TLLineShape<{ custom: string }> {
      defaultProps = {
        handles: [
          {
            id: 'start',
            point: [0, 0],
          },
          {
            id: 'end',
            point: [0, 0],
          },
        ],
        custom: 'foo',
      }
      test() {
        this.update({
          handles: [
            {
              id: 'start',
              point: [0, 0],
            },
            {
              id: 'end',
              point: [2, 2],
            },
          ],
          custom: 'bar',
        })
      }
    }
    const shape = new TestShape({
      id: 'id',
      parentId: 'page',
      point: [0, 0],
      type: 'line',
      custom: 'baz',
    })
    expect(shape).toBeDefined()
  })
})
