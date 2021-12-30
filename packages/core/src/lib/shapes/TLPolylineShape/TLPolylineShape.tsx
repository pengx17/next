import { computed, makeObservable } from 'mobx'
import { TLShapeProps, TLResizeInfo, TLShape } from '~lib'
import { Vec } from '@tldraw/vec'
import {
  intersectBoundsLineSegment,
  intersectLineSegmentPolyline,
  intersectPolylineBounds,
  TLBounds,
} from '@tldraw/intersect'
import type { TLHandle } from '~types'
import { BoundsUtils, PointUtils, PolygonUtils } from '~utils'

export interface TLPolylineShapeProps extends TLShapeProps {
  handles: TLHandle[]
}

export class TLPolylineShape<
  P extends TLPolylineShapeProps = TLPolylineShapeProps,
  M = any
> extends TLShape<P, M> {
  constructor(props = {} as Partial<P>) {
    super(props)
    makeObservable(this)
  }

  static id = 'polyline'

  @computed get points() {
    return this.props.handles.map(h => h.point)
  }

  @computed get centroid() {
    const { points } = this
    return PolygonUtils.getPolygonCentroid(points)
  }

  @computed get rotatedPoints() {
    const {
      centroid,
      props: { handles, rotation },
    } = this
    if (!rotation) return this.points
    return handles.map(h => Vec.rotWith(h.point, centroid, rotation))
  }

  getBounds = (): TLBounds => {
    const {
      points,
      props: { point },
    } = this
    return BoundsUtils.translateBounds(BoundsUtils.getBoundsFromPoints(points), point)
  }

  getRotatedBounds = (): TLBounds => {
    const {
      rotatedPoints,
      props: { point },
    } = this
    return BoundsUtils.translateBounds(BoundsUtils.getBoundsFromPoints(rotatedPoints), point)
  }

  private normalizedHandles: number[][] = []

  onResizeStart = () => {
    const {
      props: { handles },
      bounds,
    } = this
    const size = [bounds.width, bounds.height]
    this.normalizedHandles = handles.map(h => Vec.divV(h.point, size))
  }

  onResize = (bounds: TLBounds, initialProps: any, info: TLResizeInfo) => {
    const {
      props: { handles },
      normalizedHandles,
    } = this
    const size = [bounds.width, bounds.height]

    return this.update({
      point: [bounds.minX, bounds.minY],
      handles: handles.map((handle, i) => ({
        ...handle,
        point: Vec.mulV(normalizedHandles[i], size),
      })),
    })
  }

  hitTestPoint = (point: number[]): boolean => {
    const { points } = this
    return PointUtils.pointNearToPolyline(Vec.sub(point, this.props.point), points)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const {
      bounds,
      points,
      props: { point },
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
      props: { point },
    } = this
    const oBounds = BoundsUtils.translateBounds(bounds, Vec.neg(point))
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      points.every(vert => PointUtils.pointInBounds(vert, oBounds)) ||
      (BoundsUtils.boundsCollide(bounds, rotatedBounds) &&
        intersectPolylineBounds(points, oBounds).length > 0)
    )
  }

  validateProps = (props: Partial<P>) => {
    if (props.point) props.point = [0, 0]
    if (props.handles !== undefined && props.handles.length < 1) props.handles = [{ point: [0, 0] }]
    return props
  }
}
