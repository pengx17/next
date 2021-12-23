import { computed, makeObservable } from 'mobx'
import {
  BoundsUtils,
  TLBounds,
  TLResizeInfo,
  PointUtils,
  PolygonUtils,
  TLHandle,
  TLShapeWithHandles,
  TLShapeModel,
  TLShapeProps,
} from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import {
  intersectBoundsLineSegment,
  intersectLineSegmentPolyline,
  intersectPolylineBounds,
} from '@tldraw/intersect'

export interface TLPolylineShapeProps {
  handles: TLHandle[]
}

export abstract class TLPolylineShape<
  P extends TLPolylineShapeProps = TLPolylineShapeProps
> extends TLShapeWithHandles<TLHandle, P> {
  constructor(props: Partial<P> & TLShapeProps) {
    super(props)
    makeObservable(this)
  }

  static id = 'polyline'

  static defaultProps: TLPolylineShapeProps

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

  onResize = (bounds: TLBounds, info: TLResizeInfo<P>) => {
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
    const {
      points,
      props: { point: ownPoint },
    } = this
    return PointUtils.pointNearToPolyline(Vec.sub(point, ownPoint), points)
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

  validateProps = (props: Partial<TLShapeModel<TLPolylineShapeProps>>) => {
    if (props.point) props.point = [0, 0]
    if (props.handles !== undefined && props.handles.length < 1) props.handles = [{ point: [0, 0] }]
    return props
  }
}
