import type { TLShapeProps } from '~lib'
import type { TLBounds, TLHandle } from '~types'
import { BoundsUtils } from '~utils'
import { createShapeWithHandles } from './TLShapeWithHandles'

interface HandlesShape extends TLShapeProps {
  type: 'handles'
  handles: TLHandle[]
}

const handlesShapeFactory = createShapeWithHandles<HandlesShape>({
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
  get bounds(): TLBounds {
    return {
      minX: 0,
      minY: 0,
      maxX: 100,
      maxY: 100,
      width: 100,
      height: 100,
    }
  },
  get center() {
    return BoundsUtils.getBoundsCenter(this.bounds)
  },
  get rotatedBounds() {
    const { bounds } = this
    const { rotation } = this.props
    if (!rotation) return bounds
    return BoundsUtils.getBoundsFromPoints(BoundsUtils.getRotatedCorners(bounds, rotation))
  },
})

const handlesShape = handlesShapeFactory({
  id: 'handles1',
  type: 'handles',
  parentId: 'page',
  point: [0, 0],
  handles: [],
})

handlesShape.update({
  point: [0, 0],
})
