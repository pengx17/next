import { computed } from 'mobx'
import {
  BoundsUtils,
  TLBounds,
  TLResizeInfo,
  PointUtils,
  PolygonUtils,
  TLShapeModel,
} from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import { intersectLineSegmentPolyline, intersectPolygonBounds } from '@tldraw/intersect'
import { TLBoxShape, TLBoxShapeProps } from '@tldraw/box-shape'

export interface TLPolygonShapeProps extends TLBoxShapeProps {
  sides: number
  ratio: number
  isFlippedY: boolean
}

export abstract class TLPolygonShape<
  P extends TLPolygonShapeProps = TLPolygonShapeProps
> extends TLBoxShape<P> {
  static defaultProps: TLPolygonShapeProps

  static id = 'polygon'

  @computed get vertices() {
    return this.getVertices()
  }

  @computed get pageVertices() {
    const {
      props: { point },
      vertices,
    } = this
    return vertices.map(vert => Vec.add(vert, point))
  }

  @computed get centroid() {
    const { vertices } = this
    return PolygonUtils.getPolygonCentroid(vertices)
  }

  @computed get rotatedVertices() {
    const {
      vertices,
      centroid,
      props: { rotation },
    } = this
    if (!rotation) return vertices
    return vertices.map(v => Vec.rotWith(v, centroid, rotation))
  }

  getRotatedBounds = (): TLBounds => {
    const {
      rotatedVertices,
      props: { point },
      offset,
    } = this
    return BoundsUtils.translateBounds(
      BoundsUtils.getBoundsFromPoints(rotatedVertices),
      Vec.add(point, offset)
    )
  }

  @computed get offset() {
    const {
      props: {
        size: [w, h],
      },
    } = this
    const center = BoundsUtils.getBoundsCenter(BoundsUtils.getBoundsFromPoints(this.vertices))
    return Vec.sub(Vec.div([w, h], 2), center)
  }

  getVertices(padding = 0): number[][] {
    const {
      props: { ratio, sides, size, isFlippedY },
    } = this
    const vertices =
      sides === 3
        ? PolygonUtils.getTriangleVertices(size, padding, ratio)
        : PolygonUtils.getPolygonVertices(size, sides, padding, ratio)

    if (isFlippedY) {
      return vertices.map(point => [point[0], size[1] - point[1]])
    }

    return vertices
  }

  initialFlipped = this.props.isFlippedY

  onResizeStart = () => {
    this.initialFlipped = this.props.isFlippedY
  }

  onResize = (bounds: TLBounds, info: TLResizeInfo<P>) => {
    const { initialFlipped } = this
    return this.update({
      point: [bounds.minX, bounds.minY],
      size: [Math.max(1, bounds.width), Math.max(1, bounds.height)],
      isFlippedY: info.scale[1] < 0 ? !initialFlipped : initialFlipped,
    })
  }

  hitTestPoint = (point: number[]): boolean => {
    const {
      vertices,
      props: { point: ownPoint },
    } = this
    return PointUtils.pointInPolygon(Vec.add(point, ownPoint), vertices)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const {
      vertices,
      props: { point },
    } = this
    return intersectLineSegmentPolyline(Vec.sub(A, point), Vec.sub(B, point), vertices).didIntersect
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const {
      rotatedBounds,
      offset,
      rotatedVertices,
      props: { point },
    } = this
    const oBounds = BoundsUtils.translateBounds(bounds, Vec.neg(Vec.add(point, offset)))
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      rotatedVertices.every(vert => PointUtils.pointInBounds(vert, oBounds)) ||
      intersectPolygonBounds(rotatedVertices, oBounds).length > 0
    )
  }

  validateProps = (props: Partial<TLShapeModel<any>>) => {
    if (props.point) props.point = [0, 0]
    if (props.sides !== undefined && props.sides < 3) props.sides = 3
    return props
  }
}
