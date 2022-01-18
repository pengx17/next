/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLApp, TLShape, TLShapeModel } from './_TLApp'

interface BoxModel extends TLShapeModel {
  type: 'box'
}

class Box extends TLShape<BoxModel> {
  static type = 'box'
}

describe('When creating the app', () => {
  it('creates an app with an empty state if no initial state is provided.', () => {
    const app = new TLApp()
    expect(app.document).toMatchObject({
      shapes: [],
      assets: [],
    })
    expect(app.appState).toMatchObject({
      camera: [0, 0, 1],
      selectedIds: [],
    })
  })

  it('creates an app with constructor props.', () => {
    const app = new TLApp({
      id: 'app',
      document: {
        shapes: [
          {
            id: 'box1',
            type: 'box',
            point: [0, 0],
          },
        ],
        assets: [],
      },
      shapes: [Box],
    })
    expect(app.id).toBe('app')
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
        },
      ],
      assets: [],
    })
    expect(app.shapes.size).toBe(1)
    expect(app.shapes.get('box1')).toBeInstanceOf(Box)
    expect(app.shapes.get('box1')!.model).toMatchObject({
      id: 'box1',
      type: 'box',
      point: [0, 0],
    })
  })
})

describe('When cloning the app', () => {
  it('Clones the app', () => {
    const app = new TLApp({
      id: 'app',
      document: {
        shapes: [
          {
            id: 'box1',
            type: 'box',
            point: [0, 0],
          },
        ],
        assets: [],
      },
      shapes: [Box],
    })
    const clone = app.clone()
    expect(clone).toBeInstanceOf(TLApp)
    expect(clone.id).toBe(app.id)
    expect(clone.document).not.toBe(app.document)
    expect(clone.document).toMatchObject(app.document)
    expect(clone.shapes).not.toBe(app.shapes)
    expect(clone.shapes.size).toBe(app.shapes.size)
    expect(clone.shapes.get('box1')).not.toBe(app.shapes.get('box1'))
  })
})

const testApp = new TLApp({
  id: 'app',
  document: {
    shapes: [
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
      },
    ],
    assets: [],
  },
  shapes: [Box],
})

describe('When creating shapes', () => {
  it('Adds new shapes via TLApp.addShapes', () => {
    const app = testApp.clone()
    app.addShapes([
      {
        id: 'box2',
        type: 'box',
        point: [0, 0],
      },
    ])
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
        },
        {
          id: 'box2',
          type: 'box',
          point: [0, 0],
        },
      ],
      assets: [],
    })
    expect(app.shapes.size).toBe(2)
    expect(app.shapes.get('box2')).toBeInstanceOf(Box)
    expect(app.shapes.get('box2').model).toMatchObject({
      id: 'box2',
      type: 'box',
      point: [0, 0],
    })
  })
})

describe('When cloning a shape', () => {
  it('Adds new shapes via TLApp.clone', () => {
    const app = testApp.clone()
    app.getShape('box1').clone('box1clone1')
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
        },
        {
          id: 'box1clone1',
          type: 'box',
          point: [0, 0],
        },
      ],
      assets: [],
    })
  })

  it('Adds the new shape above the cloned shape', () => {
    const app = testApp.clone()
    app.getShape('box1').clone('box1clone1')
    app.getShape('box1').clone('box1clone2')
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
        },
        {
          id: 'box1clone2',
          type: 'box',
          point: [0, 0],
        },
        {
          id: 'box1clone1',
          type: 'box',
          point: [0, 0],
        },
      ],
      assets: [],
    })
  })
})

describe('When updating shapes', () => {
  it('Updates the model via TLApp.updateShapes', () => {
    const app = testApp.clone()
    app.updateShapes([
      {
        id: 'box1',
        type: 'box',
        point: [1, 1],
      },
    ])
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [1, 1],
        },
      ],
      assets: [],
    })
  })

  it('Updates the model via TLShape.update', () => {
    const app = testApp.clone()
    const box = app.shapes.get('box1')!
    box.update({ point: [2, 2] })
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [2, 2],
        },
      ],
      assets: [],
    })
  })
})

describe('When deleting a shape', () => {
  it('Removes the shape via TLApp.deleteShapes', () => {
    const app = testApp.clone()
    const boxModel = app.getShapeModel('box1')
    app.deleteShapes([boxModel])
    expect(app.document).toMatchObject({
      shapes: [],
      assets: [],
    })
    expect(app.shapes.size).toBe(0)
  })

  it('Removes the shape via TLShape.delete', () => {
    const app = testApp.clone()
    const box = app.getShape('box1')
    box.delete()
    expect(app.document).toMatchObject({
      shapes: [],
      assets: [],
    })
    expect(app.shapes.size).toBe(0)
  })
})
