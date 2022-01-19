import { makeObservable } from 'mobx'
import { Vec } from '@tldraw/vec'
import { TLPolygonShape, TLPolygonShapeModel } from '../TLPolygonShape'
import { PolygonUtils } from '~utils'
import type { TLApp } from '~lib/refactor'

export interface TLStarShapeModel extends TLPolygonShapeModel {
  sides: number
  ratio: number
}

/**
 * A star shape works just like a polygon shape, except it uses a different algorithm to find the
 * location of its vertices.
 */
export class TLStarShape<P extends TLStarShapeModel = TLStarShapeModel> extends TLPolygonShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static id = 'star'

  static defaultModel: TLStarShapeModel = {
    id: 'star',
    parentId: 'page',
    type: 'star',
    point: [0, 0],
    size: [100, 100],
    sides: 3,
    ratio: 1,
  }

  getVertices(padding = 0): number[][] {
    const {
      model: { ratio, sides, size },
    } = this
    const [w, h] = size
    const vertices = PolygonUtils.getStarVertices(
      Vec.div([w, h], 2),
      [Math.max(1, w - padding), Math.max(1, h - padding)],
      Math.round(sides),
      ratio
    )
    return vertices
  }
}
