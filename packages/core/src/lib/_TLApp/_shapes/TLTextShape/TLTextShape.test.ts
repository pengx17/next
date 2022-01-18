import { TLTextShapeModel, TLTextShape } from './TLTextShape'
import { TLApp } from '../../_TLApp'

export interface TextShapeModel extends TLTextShapeModel {
  stroke: string
}

export class TextShape extends TLTextShape<TextShapeModel> {
  static type = 'text'

  static defaultModel: TextShapeModel = {
    id: 'text',
    type: 'text',
    point: [0, 0],
    size: [100, 100],
    text: 'hello world',
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'text1',
            type: 'text',
            point: [0, 0],
            size: [100, 100],
            text: 'hello world',
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [TextShape],
    })

    expect(app.getShape('text1')).toBeDefined()
    expect(app.getShape('text1').model.stroke).toBe('black')
  })
})
