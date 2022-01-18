import { TLPolylineShapeModel, TLPolylineShape } from './TLPolylineShape'
import { TLApp } from '../../_TLApp'

export interface PolylineShapeModel extends TLPolylineShapeModel {
  stroke: string
}

export class PolylineShape extends TLPolylineShape<PolylineShapeModel> {
  static type = 'polyline'

  static defaultModel: PolylineShapeModel = {
    id: 'polyline',
    type: 'polyline',
    point: [0, 0],
    handles: [{ point: [0, 0] }, { point: [100, 100] }],
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'polyline1',
            type: 'polyline',
            point: [0, 0],
            handles: [{ point: [0, 0] }, { point: [100, 100] }],
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [PolylineShape],
    })

    expect(app.getShape('polyline1')).toBeDefined()
    expect(app.getShape('polyline1').model.stroke).toBe('black')
  })
})
