import { TLBoxShapeModel, TLBoxShape } from './TLBoxShape'
import { TLApp } from '~lib'

export interface BoxShapeModel extends TLBoxShapeModel {
  stroke: string
}

export class BoxShape extends TLBoxShape<BoxShapeModel> {
  static type = 'box'

  static defaultModel: BoxShapeModel = {
    id: 'box',
    type: 'box',
    point: [0, 0],
    size: [100, 100],
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'box1',
            type: 'box',
            point: [0, 0],
            size: [100, 100],
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [BoxShape],
    })
    expect(app.getShape('box1')).toBeDefined()
    expect(app.getShape('box1').model.stroke).toBe('black')
  })
})
