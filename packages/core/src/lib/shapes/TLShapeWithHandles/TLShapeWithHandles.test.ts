import type { TLShapeProps } from '~lib'
import type { TLBounds, TLHandle } from '~types'
import { BoundsUtils } from '~utils'
import { createShapeWithHandles } from './TLShapeWithHandles'

interface HandlesShape extends TLShapeProps {
  type: 'handles'
  handles: TLHandle[]
}

const ShapeWithHandles = createShapeWithHandles<HandlesShape>({
  type: 'handles',
  defaultProps: {
    id: 'id',
    type: 'handles',
    parentId: 'page',
    point: [0, 0],
    handles: [
      {
        id: 'start',
        point: [0, 0],
      },
    ],
  },
  bounds() {
    const [x, y] = this.props.point
    return {
      minX: x,
      minY: y,
      maxX: x + 100,
      maxY: y + 100,
      width: 100,
      height: 100,
    }
  },
  rotatedBounds() {
    return BoundsUtils.getBoundsFromPoints(
      BoundsUtils.getRotatedCorners(this.bounds, this.props.rotation)
    )
  },
  center() {
    const [x, y] = this.props.point
    return [x + 50, y + 50]
  },
})

const handlesShape = new ShapeWithHandles({
  id: 'handles1',
  type: 'handles',
  parentId: 'page',
  point: [0, 0],
  handles: [],
})

handlesShape.update({
  point: [0, 0],
})

describe('Shape with handles', () => {
  it('Creates the shape', () => {
    expect(handlesShape).toBeDefined()
  })
})
