import { computed, makeObservable } from 'mobx'
import { Vec } from '@tldraw/vec'
import {
  intersectBoundsLineSegment,
  intersectLineSegmentPolyline,
  intersectPolylineBounds,
  TLBounds,
} from '@tldraw/intersect'
import { BoundsUtils, PointUtils, PolygonUtils } from '~utils'
import { TLHandle, TLShapeModel, TLResizeInfo, TLShape } from '../TLShape'
import type { TLApp } from '~lib/refactor'

export interface TLPolylineShapeModel extends TLShapeModel {
  handles: TLHandle[]
}

export class TLPolylineShape<
  P extends TLPolylineShapeModel = TLPolylineShapeModel
> extends TLShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static type = 'polyline'

  static defaultProps: TLPolylineShapeModel = {
    id: 'polyline',
    type: 'polyline',
    parentId: 'page',
    point: [0, 0],
    handles: [{ id: '0', point: [0, 0] }],
  }

  @computed get points() {
    return this.model.handles.map(h => h.point)
  }

  @computed get centroid() {
    const { points } = this
    return PolygonUtils.getPolygonCentroid(points)
  }

  @computed get rotatedPoints() {
    const {
      centroid,
      points,
      model: { handles, rotation },
    } = this
    if (!rotation) return points
    return handles.map(h => Vec.rotWith(h.point, centroid, rotation))
  }

  getBounds = (): TLBounds => {
    const {
      points,
      model: { point },
    } = this
    return BoundsUtils.translateBounds(BoundsUtils.getBoundsFromPoints(points), point)
  }

  getRotatedBounds = (): TLBounds => {
    const {
      rotatedPoints,
      model: { point },
    } = this
    return BoundsUtils.translateBounds(BoundsUtils.getBoundsFromPoints(rotatedPoints), point)
  }

  private normalizedHandles: number[][] = []

  onResizeStart = () => {
    const {
      model: { handles },
      bounds,
    } = this
    this.scale = [...(this.model.scale ?? [1, 1])]
    const size = [bounds.width, bounds.height]
    this.normalizedHandles = handles.map(h => Vec.divV(h.point, size))
    return this
  }

  onResize = (initialProps: any, info: TLResizeInfo) => {
    const {
      bounds,
      scale: [scaleX, scaleY],
    } = info
    const {
      model: { handles },
      normalizedHandles,
    } = this
    const size = [bounds.width, bounds.height]
    const nextScale = [...this.scale]
    if (scaleX < 0) nextScale[0] *= -1
    if (scaleY < 0) nextScale[1] *= -1
    return this.update({
      point: [bounds.minX, bounds.minY],
      handles: handles.map((handle, i) => ({
        ...handle,
        point: Vec.mulV(normalizedHandles[i], size),
      })),
      scale: nextScale,
    })
  }

  hitTestPoint = (point: number[]): boolean => {
    const { points } = this
    return PointUtils.pointNearToPolyline(Vec.sub(point, this.model.point), points)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const {
      bounds,
      points,
      model: { point },
    } = this
    if (
      PointUtils.pointInBounds(A, bounds) ||
      PointUtils.pointInBounds(B, bounds) ||
      intersectBoundsLineSegment(bounds, A, B).length > 0
    ) {
      const rA = Vec.sub(A, point)
      const rB = Vec.sub(B, point)
      return (
        intersectLineSegmentPolyline(rA, rB, points).didIntersect ||
        !!points.find(point => Vec.dist(rA, point) < 5 || Vec.dist(rB, point) < 5)
      )
    }
    return false
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const {
      rotatedBounds,
      points,
      model: { point },
    } = this
    const oBounds = BoundsUtils.translateBounds(bounds, Vec.neg(point))
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      points.every(vert => PointUtils.pointInBounds(vert, oBounds)) ||
      (BoundsUtils.boundsCollide(bounds, rotatedBounds) &&
        intersectPolylineBounds(points, oBounds).length > 0)
    )
  }

  validateProps = (model: Partial<P>) => {
    if (model.point) model.point = [0, 0]
    if (model.handles !== undefined && model.handles.length < 1) model.handles = [{ point: [0, 0] }]
    return model
  }
}
