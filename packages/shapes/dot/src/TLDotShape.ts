import { TLShape, BoundsUtils, TLBounds, TLResizeInfo } from '@tldraw/core'

export interface TLDotShapeProps {
  radius: number
}

export abstract class TLDotShape<P extends TLDotShapeProps = TLDotShapeProps> extends TLShape<P> {
  abstract defaultProps: P

  static id = 'dot'

  readonly hideSelection = true
  readonly hideResizeHandles = true
  readonly hideRotateHandle = true
  readonly hideSelectionDetail = true

  getBounds = (): TLBounds => {
    const {
      point: [x, y],
      radius,
    } = this.props
    return {
      minX: x,
      minY: y,
      maxX: x + radius * 2,
      maxY: y + radius * 2,
      width: radius * 2,
      height: radius * 2,
    }
  }

  getRotatedBounds = (): TLBounds => {
    return BoundsUtils.getBoundsFromPoints(
      BoundsUtils.getRotatedCorners(this.bounds, this.props.rotation)
    )
  }

  onResize = (bounds: TLBounds, info: TLResizeInfo<P>): this => {
    const { radius } = this.props
    return this.update({
      point: [bounds.minX + bounds.width / 2 - radius, bounds.minY + bounds.height / 2 - radius],
    })
  }
}
