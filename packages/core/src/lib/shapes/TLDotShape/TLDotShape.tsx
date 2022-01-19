import type { TLBounds } from '@tldraw/intersect'
import { makeObservable } from 'mobx'
import { TLShape, TLShapeModel, TLResizeInfo } from '../../TLShape'
import type { TLApp } from '../../TLApp'
import { BoundsUtils } from '~utils'

export interface TLDotShapeModel extends TLShapeModel {
  radius: number
}

export class TLDotShape<P extends TLDotShapeModel = TLDotShapeModel> extends TLShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static type = 'dot'

  static defaultModel: TLDotShapeModel = {
    id: 'dot',
    type: 'dot',
    parentId: 'page',
    point: [0, 0],
    radius: 6,
  }

  hideSelection = true
  hideResizeHandles = true
  hideRotateHandle = true
  hideSelectionDetail = true

  getBounds = (): TLBounds => {
    const {
      model: {
        point: [x, y],
        radius,
      },
    } = this
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
      BoundsUtils.getRotatedCorners(this.bounds, this.model.rotation)
    )
  }

  onResize = (initialModel: P, info: TLResizeInfo): this => {
    const {
      model: { radius },
    } = this
    return this.update({
      point: [
        info.bounds.minX + info.bounds.width / 2 - radius,
        info.bounds.minY + info.bounds.height / 2 - radius,
      ],
    })
  }
}
