import { TLEllipseShapeModel, TLEllipseShape } from './TLEllipseShape'
import { TLApp } from '../../_TLApp'

export interface EllispeShapeModel extends TLEllipseShapeModel {
  stroke: string
}

export class EllispeShape extends TLEllipseShape<EllispeShapeModel> {
  static type = 'ellipse'

  static defaultModel: EllispeShapeModel = {
    id: 'ellipse',
    parentId: 'page',
    type: 'ellipse',
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
            id: 'ellipse1',
            type: 'ellipse',
            point: [0, 0],
            size: [100, 100],
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [EllispeShape],
    })

    expect(app.getShape('ellipse1')).toBeDefined()
    expect(app.getShape('ellipse1').model.stroke).toBe('black')
  })
})
