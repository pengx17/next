import type { TLBoxShapeProps } from '.'
import { TLBoxShape } from './TLBoxShape'

describe('A minimal test', () => {
  it('Creates the shape', () => {
    interface BoxShapeProps extends TLBoxShapeProps {
      stroke: string
    }

    class BoxShape extends TLBoxShape<BoxShapeProps> {
      defaultProps = {
        id: 'box',
        parentId: 'page',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
        stroke: 'black',
      }
    }

    const shape = new BoxShape()
    expect(shape).toBeDefined()
    expect(shape.props.stroke).toBe('black')
  })
})
