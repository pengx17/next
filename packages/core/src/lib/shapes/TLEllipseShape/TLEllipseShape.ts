import { intersectLineSegmentEllipse, intersectEllipseBounds, TLBounds } from '@tldraw/intersect'
import { makeObservable } from 'mobx'
import type { TLApp } from '../../TLApp'
import { BoundsUtils, PointUtils } from '~utils'
import { TLBoxShape, TLBoxShapeModel } from '../TLBoxShape'

export interface TLEllipseShapeModel extends TLBoxShapeModel {
  point: number[]
}

export class TLEllipseShape<
  P extends TLEllipseShapeModel = TLEllipseShapeModel
> extends TLBoxShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static type = 'ellipse'

  static defaultModel: TLEllipseShapeModel = {
    id: 'ellipse',
    type: 'ellipse',
    parentId: 'page',
    point: [0, 0],
    size: [100, 100],
  }

  getBounds = (): TLBounds => {
    const {
      model: {
        point: [x, y],
        size: [w, h],
      },
    } = this
    return BoundsUtils.getRotatedEllipseBounds(x, y, w / 2, h / 2, 0)
  }

  getRotatedBounds = (): TLBounds => {
    const {
      model: {
        point: [x, y],
        size: [w, h],
        rotation,
      },
    } = this
    return BoundsUtils.getRotatedEllipseBounds(x, y, w / 2, h / 2, rotation)
  }

  hitTestPoint = (point: number[]) => {
    const {
      model: { size, rotation },
      center,
    } = this
    return PointUtils.pointInEllipse(point, center, size[0], size[1], rotation || 0)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const {
      model: {
        size: [w, h],
        rotation = 0,
      },
      center,
    } = this
    return intersectLineSegmentEllipse(A, B, center, w, h, rotation).didIntersect
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const {
      model: {
        size: [w, h],
        rotation = 0,
      },
      rotatedBounds,
    } = this
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      intersectEllipseBounds(this.center, w / 2, h / 2, rotation, bounds).length > 0
    )
  }
}
