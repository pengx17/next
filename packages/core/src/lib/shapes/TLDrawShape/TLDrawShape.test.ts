import { TLDrawShapeModel, TLDrawShape } from './TLDrawShape'
import { TLApp } from '~lib'

export interface DrawShapeProps extends TLDrawShapeModel {
  stroke: string
}

export class DrawShape extends TLDrawShape<DrawShapeProps> {
  static type = 'draw'

  static defaultModel: DrawShapeProps = {
    id: 'draw',
    type: 'draw',
    point: [0, 0],
    points: [
      [0, 0],
      [1, 1],
    ],
    isComplete: false,
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'draw1',
            type: 'draw',
            point: [0, 0],
            points: [
              [0, 0],
              [1, 1],
            ],
            isComplete: false,
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [DrawShape],
    })

    expect(app.getShape('draw1')).toBeDefined()
    expect(app.getShape('draw1').model.stroke).toBe('black')
  })
})
