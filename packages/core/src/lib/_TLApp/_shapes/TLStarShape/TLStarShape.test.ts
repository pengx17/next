import { TLStarShapeModel, TLStarShape } from './TLStarShape'
import { TLApp } from '../../_TLApp'

export interface StarShapeModel extends TLStarShapeModel {
  stroke: string
}

export class StarShape extends TLStarShape<StarShapeModel> {
  static type = 'star'

  static defaultModel: StarShapeModel = {
    id: 'star',
    type: 'star',
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
            id: 'star1',
            type: 'star',
            point: [0, 0],
            size: [100, 100],
            sides: 5,
            ratio: 1,
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [StarShape],
    })

    expect(app.getShape('star1')).toBeDefined()
    expect(app.getShape('star1').model.stroke).toBe('black')
  })
})
