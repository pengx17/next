import { Vec } from '@tldraw/vec'
import { computed, makeObservable } from 'mobx'
import { intersectLineSegmentPolyline, intersectPolygonBounds, TLBounds } from '@tldraw/intersect'
import { BoundsUtils, PointUtils, PolygonUtils } from '~utils'
import { TLBoxShape, TLBoxShapeModel } from '../TLBoxShape'
import type { TLApp } from '~lib'

export interface TLPolygonShapeModel extends TLBoxShapeModel {
  sides: number
  ratio: number
}

export class TLPolygonShape<
  P extends TLPolygonShapeModel = TLPolygonShapeModel
> extends TLBoxShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static type = 'polygon'

  static defaultModel: TLPolygonShapeModel = {
    id: 'polygon',
    type: 'polygon',
    parentId: 'page',
    point: [0, 0],
    size: [100, 100],
    sides: 5,
    ratio: 1,
  }

  @computed get vertices() {
    return this.getVertices()
  }

  @computed get pageVertices() {
    const {
      model: { point },
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
      model: { rotation },
    } = this
    if (!rotation) return vertices
    return vertices.map(v => Vec.rotWith(v, centroid, rotation))
  }

  getRotatedBounds = (): TLBounds => {
    const {
      rotatedVertices,
      model: { point },
      offset,
    } = this
    return BoundsUtils.translateBounds(
      BoundsUtils.getBoundsFromPoints(rotatedVertices),
      Vec.add(point, offset)
    )
  }

  @computed get offset() {
    const {
      model: {
        size: [w, h],
      },
    } = this
    const center = BoundsUtils.getBoundsCenter(BoundsUtils.getBoundsFromPoints(this.vertices))
    return Vec.sub(Vec.div([w, h], 2), center)
  }

  getVertices(padding = 0): number[][] {
    const {
      model: { ratio, sides, size },
    } = this
    const vertices =
      sides === 3
        ? PolygonUtils.getTriangleVertices(size, padding, ratio)
        : PolygonUtils.getPolygonVertices(size, sides, padding, ratio)
    return vertices
  }

  hitTestPoint = (point: number[]): boolean => {
    const { vertices, model } = this
    return PointUtils.pointInPolygon(Vec.add(point, model.point), vertices)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const {
      vertices,
      model: { point },
    } = this
    return intersectLineSegmentPolyline(Vec.sub(A, point), Vec.sub(B, point), vertices).didIntersect
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const {
      rotatedBounds,
      offset,
      rotatedVertices,
      model: { point },
    } = this
    const oBounds = BoundsUtils.translateBounds(bounds, Vec.neg(Vec.add(point, offset)))
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      rotatedVertices.every(vert => PointUtils.pointInBounds(vert, oBounds)) ||
      intersectPolygonBounds(rotatedVertices, oBounds).length > 0
    )
  }

  validateModel = (model: Partial<P>) => {
    if (model.point) model.point = [0, 0]
    if (model.sides !== undefined && model.sides < 3) model.sides = 3
    return model
  }
}
