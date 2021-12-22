import { computed, makeObservable } from 'mobx'
import { TLShape, BoundsUtils, TLBounds, TLResizeInfo, PointUtils, TLApp } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import {
  intersectBoundsLineSegment,
  intersectLineSegmentPolyline,
  intersectPolylineBounds,
} from '@tldraw/intersect'

export interface TLDrawShapeProps {
  points: number[][]
  isComplete: boolean
}

export abstract class TLDrawShape<
  P extends TLDrawShapeProps = TLDrawShapeProps,
  A extends TLApp<any, any> = TLApp<any, any>
> extends TLShape<P, A> {
  static id = 'draw'

  abstract defaultProps: P

  constructor(app: A, pageId: string, id: string) {
    super(app, pageId, id)
    makeObservable(this)
  }

  /** The shape's bounds in "shape space". */
  @computed get pointBounds(): TLBounds {
    const {
      props: { points },
    } = this
    return BoundsUtils.getBoundsFromPoints(points)
  }

  /** The shape's bounds in "page space". */
  getBounds = (): TLBounds => {
    const {
      pointBounds,
      props: { point },
    } = this
    return BoundsUtils.translateBounds(pointBounds, point)
  }

  /** The shape's rotated points in "shape space". */
  @computed get rotatedPoints(): number[][] {
    const {
      center,
      props: { point, points, rotation },
    } = this
    if (!rotation) return points
    const relativeCenter = Vec.sub(center, point)
    return points.map(point => Vec.rotWith(point, relativeCenter, rotation))
  }

  /** The shape's rotated bounds in "page space". */
  getRotatedBounds = (): TLBounds => {
    const {
      bounds,
      rotatedPoints,
      props: { rotation, point },
    } = this
    if (!rotation) return bounds
    return BoundsUtils.translateBounds(BoundsUtils.getBoundsFromPoints(rotatedPoints), point)
  }

  /**
   * A snapshot of the shape's points normalized against its bounds. For performance and memory
   * reasons, this property must be set manually with `setNormalizedPoints`.
   */
  normalizedPoints: number[][] = []
  isResizeFlippedX = false
  isResizeFlippedY = false

  /** Prepare the shape for a resize session. */
  onResizeStart = () => {
    const {
      bounds,
      props: { points },
    } = this
    const size = [bounds.width, bounds.height]
    this.normalizedPoints = points.map(point => Vec.divV(point, size))
  }

  /**
   * Resize the shape to fit a new bounding box.
   *
   * @param bounds
   * @param info
   */
  onResize = (bounds: TLBounds, info: TLResizeInfo<P>) => {
    const size = [bounds.width, bounds.height]
    const flipX = info.scale[0] < 0
    const flipY = info.scale[1] < 0

    this.update({
      point: [bounds.minX, bounds.minY],
      points: this.normalizedPoints.map(point => {
        if (flipX) point = [1 - point[0], point[1]]
        if (flipY) point = [point[0], 1 - point[1]]
        return Vec.mulV(point, size).concat(point[2])
      }),
    })
    return this
  }

  hitTestPoint = (point: number[]): boolean => {
    const { points, point: ownPoint } = this.props
    return PointUtils.pointNearToPolyline(Vec.sub(point, ownPoint), points)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const {
      bounds,
      props: { points, point },
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
      props: { points, point },
    } = this
    const oBounds = BoundsUtils.translateBounds(bounds, Vec.neg(point))
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      points.every(vert => PointUtils.pointInBounds(vert, oBounds)) ||
      (BoundsUtils.boundsCollide(bounds, rotatedBounds) &&
        intersectPolylineBounds(points, oBounds).length > 0)
    )
  }
}
