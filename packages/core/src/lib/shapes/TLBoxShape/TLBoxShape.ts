import { createShapeClass, TLShape, TLShapeOptions, TLShapeProps } from '~lib'
import { BoundsUtils } from '~utils'

export interface TLBoxShapeProps extends TLShapeProps {
  type: 'box'
  size: number[]
}

export type TLBoxShape<
  P extends TLBoxShapeProps = TLBoxShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = TLShape<P, C>

export type TLBoxShapeClass<
  P extends TLBoxShapeProps = TLBoxShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = {
  new (props: P): TLBoxShape<P, C>
  id: P['id']
}

export function createBoxShapeClass<
  P extends TLBoxShapeProps = TLBoxShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
>(options = {} as TLShapeOptions<P, C> & ThisType<TLShape<P, C>>): TLBoxShapeClass<P, C> {
  return createShapeClass({
    ...options,
    bounds() {
      const [x, y] = this.props.point
      const [width, height] = this.props.size
      return {
        minX: x,
        minY: y,
        maxX: x + width,
        maxY: y + height,
        width,
        height,
      }
    },
    rotatedBounds() {
      return BoundsUtils.getBoundsFromPoints(
        BoundsUtils.getRotatedCorners(this.bounds, this.props.rotation)
      )
    },
    center() {
      const [x, y] = this.props.point
      const [width, height] = this.props.size
      return [x + width / 2, y + height / 2]
    },
  })
}
