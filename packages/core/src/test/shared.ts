import { TLApp } from '../lib/TLApp'
import { TLShape, TLShapeModel } from '../lib/TLShape'

export interface BoxModel extends TLShapeModel {
  type: 'box'
}

export class Box extends TLShape<BoxModel> {
  static type = 'box'
}

export const testApp = new TLApp({
  id: 'app',
  document: {
    shapes: [
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
      },
    ],
    selectedIds: [],
  },
  shapes: [Box],
})
