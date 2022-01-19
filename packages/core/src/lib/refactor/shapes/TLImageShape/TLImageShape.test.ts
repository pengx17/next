import { TLImageShapeModel, TLImageShape } from './TLImageShape'
import { TLApp } from '../../TLApp'

export interface ImageShapeModel extends TLImageShapeModel {
  stroke: string
}

export class ImageShape extends TLImageShape<ImageShapeModel> {
  static type = 'image'

  static defaultModel: ImageShapeModel = {
    id: 'image',
    type: 'image',
    point: [0, 0],
    size: [100, 100],
    clipping: 0,
    objectFit: 'fill',
    assetId: '',
    stroke: 'black',
  }
}

describe('A minimal test', () => {
  it('Creates the shape', () => {
    const app = new TLApp({
      document: {
        shapes: [
          {
            id: 'image1',
            type: 'image',
            point: [0, 0],
            size: [100, 100],
            clipping: 0,
            objectFit: 'fill',
            assetId: '',
            stroke: 'black',
          },
        ],
        selectedIds: [],
      },
      shapes: [ImageShape],
    })

    expect(app.getShape('image1')).toBeDefined()
    expect(app.getShape('image1').model.stroke).toBe('black')
  })
})
