import { intersectEllipseBounds, intersectLineSegmentEllipse } from '@tldraw/intersect'
import { createShapeFactory, TLShape, TLShapeOptions, TLShapeProps } from '~lib'
import { BoundsUtils, PointUtils } from '~utils'

export interface TLEllipseShapeProps extends TLShapeProps {
  type: 'ellipse'
  size: number[]
}

export type TLEllipseShape<
  P extends TLEllipseShapeProps = TLEllipseShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = TLShape<P, C>

export type TLEllipseShapeFactory<
  P extends TLEllipseShapeProps = TLEllipseShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = (props: P) => TLEllipseShape<P, C>

export function createEllipseShapeFactory<
  P extends TLEllipseShapeProps = TLEllipseShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
>(
  options = {} as TLShapeOptions<P, C> & ThisType<TLEllipseShape<P, C>>
): TLEllipseShapeFactory<P, C> {
  return createShapeFactory<P, C>({
    get bounds() {
      const [x, y] = this.props.point
      const [width, height] = this.props.size
      return BoundsUtils.getRotatedEllipseBounds(x, y, width / 2, height / 2, 0)
    },
    get rotatedBounds() {
      const [x, y] = this.props.point
      const [width, height] = this.props.size
      return BoundsUtils.getRotatedEllipseBounds(x, y, width / 2, height / 2, this.props.rotation)
    },
    hitTestPoint(point) {
      return PointUtils.pointInEllipse(
        point,
        this.center,
        this.props.size[0],
        this.props.size[1],
        this.props.rotation || 0
      )
    },
    hitTestLineSegment(A, B) {
      return intersectLineSegmentEllipse(
        A,
        B,
        this.center,
        this.props.size[0],
        this.props.size[1],
        this.props.rotation || 0
      ).didIntersect
    },
    hitTestBounds(bounds) {
      const { rotatedBounds } = this
      return (
        BoundsUtils.boundsContain(bounds, rotatedBounds) ||
        intersectEllipseBounds(
          this.center,
          this.props.size[0] / 2,
          this.props.size[1] / 2,
          this.props.rotation || 0,
          bounds
        ).length > 0
      )
    },
    ...options,
  })
}
