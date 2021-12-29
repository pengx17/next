import type { TLBounds } from '@tldraw/intersect'
import { makeObservable } from 'mobx'
import { TLResizeInfo, TLShape, TLShapeProps } from '~lib'
import { BoundsUtils } from '~utils'

export interface TLBoxShapeProps extends TLShapeProps {
  size: number[]
}

export class TLBoxShape<P extends TLBoxShapeProps = TLBoxShapeProps, M = any> extends TLShape<
  P,
  M
> {
  constructor(props = {} as Partial<P>) {
    super(props)
    this.props = { ...this.defaultProps, ...this.props }
    makeObservable(this)
  }

  static id = 'box'

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

  onResize = (bounds: TLBounds, initialProps: any, info: TLResizeInfo): this => {
    return this.update({
      point: [bounds.minX, bounds.minY],
      size: [Math.max(1, bounds.width), Math.max(1, bounds.height)],
    })
  }

  validateProps = (props: Partial<P>) => {
    if (props.size !== undefined) {
      props.size[0] = Math.max(props.size[0], 1)
      props.size[1] = Math.max(props.size[1], 1)
    }
    return props
  }
}
