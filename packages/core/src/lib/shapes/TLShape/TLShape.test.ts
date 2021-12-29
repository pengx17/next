import type { TLBounds } from '~types'
import { BoundsUtils } from '~utils'
import { createShape, TLShapeProps } from './TLShape'

interface BoxShape extends TLShapeProps {
  type: 'box'
  size: number[]
}

const boxFactory = createShape<BoxShape>({
  type: 'test',
  defaultProps: {
    id: 'id',
    type: 'box',
    parentId: 'page',
    point: [0, 0],
    size: [100, 100],
  },
  get bounds(): TLBounds {
    return {
      minX: 0,
      minY: 0,
      maxX: this.props.size[0],
      maxY: this.props.size[1],
      width: this.props.size[0],
      height: this.props.size[1],
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

const box = boxFactory({
  id: 'box1',
  point: [0, 0],
  size: [100, 100],
})
