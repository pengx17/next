import { TLPolygonShapeModel, TLPolygonShape } from './TLPolygonShape'
import { TLApp } from '../../_TLApp'

export interface PolygonShapeModel extends TLPolygonShapeModel {
  stroke: string
}

export class PolygonShape extends TLPolygonShape<PolygonShapeModel> {
  static type = 'polygon'

  static defaultModel: PolygonShapeModel = {
    id: 'polygon',
    type: 'polygon',
    point: [0, 0],
    size: [100, 100],
    sides: 5,
    ratio: 1,
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'polygon1',
            type: 'polygon',
            point: [0, 0],
            size: [100, 100],
            sides: 5,
            ratio: 1,
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [PolygonShape],
    })

    expect(app.getShape('polygon1')).toBeDefined()
    expect(app.getShape('polygon1').model.stroke).toBe('black')
  })
})
