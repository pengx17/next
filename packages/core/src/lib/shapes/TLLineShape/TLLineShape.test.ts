import { TLLineShapeModel, TLLineShape } from './TLLineShape'
import { TLApp } from '~lib'

export interface LineShapeProps extends TLLineShapeModel {
  stroke: string
}

export class LineShape extends TLLineShape<LineShapeProps> {
  static type = 'line'

  static defaultModel: LineShapeProps = {
    id: 'line',
    type: 'line',
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
            id: 'line1',
            type: 'line',
            point: [0, 0],
            handles: [{ point: [0, 0] }, { point: [100, 100] }],
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [LineShape],
    })

    expect(app.getShape('line1')).toBeDefined()
    expect(app.getShape('line1').model.stroke).toBe('black')
  })
})
