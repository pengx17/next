import { makeObservable } from 'mobx'
import type { TLApp } from '~lib/refactor'
import type { TLHandle } from '~types'
import { TLPolylineShape, TLPolylineShapeModel } from '../TLPolylineShape'

export interface TLLineShapeModel extends TLPolylineShapeModel {
  handles: TLHandle[]
}

export class TLLineShape<P extends TLLineShapeModel = TLLineShapeModel> extends TLPolylineShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static type = 'line'

  static defaultModel: TLLineShapeModel = {
    id: 'line',
    type: 'line',
    parentId: 'page',
    point: [0, 0],
    handles: [
      { id: 'start', point: [0, 0] },
      { id: 'end', point: [1, 1] },
    ],
  }

  validateModel = (model: Partial<P>) => {
    if (model.point) model.point = [0, 0]
    if (model.handles !== undefined && model.handles.length < 1) model.handles = [{ point: [0, 0] }]
    return model
  }
}
