import { makeObservable } from 'mobx'
import type { TLBounds } from '@tldraw/intersect'
import { BoundsUtils } from '~utils'
import { TLShape, TLShapeModel, TLResizeInfo } from '../../TLShape'
import type { TLApp } from '../../TLApp'

export interface TLBoxShapeModel extends TLShapeModel {
  size: number[]
}

export class TLBoxShape<P extends TLBoxShapeModel = TLBoxShapeModel> extends TLShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static type = 'box'

  static defaultModel: TLBoxShapeModel = {
    id: 'box',
    type: 'box',
    point: [0, 0],
    size: [100, 100],
  }

  getBounds = (): TLBounds => {
    const [x, y] = this.model.point
    const [width, height] = this.model.size
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
      BoundsUtils.getRotatedCorners(this.bounds, this.model.rotation)
    )
  }

  onResize = (initialProps: any, info: TLResizeInfo): this => {
    const {
      bounds,
      scale: [scaleX, scaleY],
    } = info
    const nextScale = [...this.scale]
    if (scaleX < 0) nextScale[0] *= -1
    if (scaleY < 0) nextScale[1] *= -1
    return this.update({
      point: [bounds.minX, bounds.minY],
      size: [Math.max(1, bounds.width), Math.max(1, bounds.height)],
      scale: nextScale,
    })
  }

  validateModel = (model: Partial<P>) => {
    if (model.size !== undefined) {
      model.size[0] = Math.max(model.size[0], 1)
      model.size[1] = Math.max(model.size[1], 1)
    }
    return model
  }
}
