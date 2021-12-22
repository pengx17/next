import { BoundsUtils, TLBounds, TLResizeInfo, TLShape } from '@tldraw/core'

export interface TLBoxShapeProps {
  size: number[]
}

export abstract class TLBoxShape<P extends TLBoxShapeProps = TLBoxShapeProps> extends TLShape<P> {
  static id = 'box'

  abstract defaultProps: P

  getBounds = (): TLBounds => {
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
  }

  getRotatedBounds = (): TLBounds => {
    return BoundsUtils.getBoundsFromPoints(
      BoundsUtils.getRotatedCorners(this.bounds, this.props.rotation)
    )
  }

  onResize = (bounds: TLBounds, info: TLResizeInfo<P>): this => {
    return this.update({
      point: [bounds.minX, bounds.minY],
      size: [Math.max(1, bounds.width), Math.max(1, bounds.height)],
    })
  }
}
