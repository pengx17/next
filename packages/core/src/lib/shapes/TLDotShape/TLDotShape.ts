import { intersectCircleBounds } from '@tldraw/intersect'
import Vec from '@tldraw/vec'
import { createShapeClass, TLShape, TLShapeOptions, TLShapeProps } from '~lib'
import { BoundsUtils } from '~utils'

export interface TLDotShapeProps extends TLShapeProps {
  type: 'dot'
  radius: number
}

export type TLDotShape<
  P extends TLDotShapeProps = TLDotShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = TLShape<P, C>

export type TLDotShapeClass<
  P extends TLDotShapeProps = TLDotShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = {
  new (props: P): TLDotShape<P, C>
  id: P['id']
}

export function createDotShapeClass<
  P extends TLDotShapeProps = TLDotShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
>(options = {} as TLShapeOptions<P, C> & ThisType<TLDotShape<P, C>>): TLDotShapeClass<P, C> {
  return createShapeClass<P, C>({
    ...options,
    hideSelection: true,
    hideResizeHandles: true,
    hideRotateHandle: true,
    hideSelectionDetail: true,
    bounds() {
      const {
        point: [x, y],
        radius,
      } = this.props
      const d = radius * 2
      return {
        minX: x,
        minY: y,
        maxX: x + d,
        maxY: y + d,
        width: d,
        height: d,
      }
    },
    rotatedBounds() {
      return BoundsUtils.getBoundsFromPoints(
        BoundsUtils.getRotatedCorners(this.bounds, this.props.rotation)
      )
    },
    hitTestPoint(point) {
      return Vec.dist(point, this.props.point) < this.props.radius
    },
    hitTestLineSegment(A, B) {
      return Vec.distanceToLineSegment(A, B, this.props.point) < this.props.radius
    },
    hitTestBounds(bounds) {
      return intersectCircleBounds(this.props.point, this.props.radius, bounds).length > 0
    },
  })
}
