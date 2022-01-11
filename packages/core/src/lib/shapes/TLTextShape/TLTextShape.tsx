import type { TLBounds } from '@tldraw/intersect'
import { makeObservable } from 'mobx'
import { TLResizeInfo, TLShape, TLShapeProps } from '../TLShape'
import { BoundsUtils } from '~utils'

export interface TLTextShapeProps extends TLShapeProps {
  text: string
}

export class TLTextShape<P extends TLTextShapeProps = TLTextShapeProps, M = any> extends TLShape<
  P,
  M
> {
  constructor(props = {} as Partial<P>) {
    super(props)
    makeObservable(this)
  }

  static id = 'text'

  static defaultProps: TLTextShapeProps = {
    id: 'text',
    type: 'text',
    parentId: 'page',
    point: [0, 0],
    text: '',
  }

  getBounds = (): TLBounds => {
    const [x, y] = this.props.point
    // TODO
    return {
      minX: x,
      minY: y,
      maxX: x + 100,
      maxY: y + 100,
      width: 100,
      height: 100,
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
}
