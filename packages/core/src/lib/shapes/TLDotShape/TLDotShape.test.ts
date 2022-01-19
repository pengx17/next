import { TLDotShapeModel, TLDotShape } from './TLDotShape'
import { TLApp } from '~lib'

export interface DotShapeProps extends TLDotShapeModel {
  stroke: string
}

export class DotShape extends TLDotShape<DotShapeProps> {
  static type = 'dot'

  static defaultModel: DotShapeProps = {
    id: 'dot',
    type: 'dot',
    radius: 3,
    point: [0, 0],
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'dot1',
            type: 'dot',
            point: [0, 0],
            radius: 3,
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [DotShape],
    })

    expect(app.getShape('dot1')).toBeDefined()
    expect(app.getShape('dot1').model.stroke).toBe('black')
  })
})
