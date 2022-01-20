import { makeObservable } from 'mobx'
import type { TLApp } from '../../TLApp'
import { TLBoxShape, TLBoxShapeModel } from '../TLBoxShape'

export interface TLTextShapeModel extends TLBoxShapeModel {
  text: string
}

export class TLTextShape<P extends TLTextShapeModel = TLTextShapeModel> extends TLBoxShape<P> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  canEdit = true

  canFlip = false

  static type = 'text'

  static defaultModel: TLTextShapeModel = {
    id: 'text',
    type: 'text',
    parentId: 'page',
    isSizeLocked: true,
    point: [0, 0],
    size: [16, 32],
    text: '',
  }
}
