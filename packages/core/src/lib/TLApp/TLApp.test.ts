/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLTestApp } from '~test'
import { TLApp, TLBoxShape, TLShape, TLShapeModel } from '~lib'

export interface BoxModel extends TLShapeModel {
  type: 'box'
}

export class Box extends TLShape<BoxModel> {
  static type = 'box'
}

export const testApp = new TLApp({
  id: 'app',
  document: {
    shapes: [
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
      },
    ],
  },
  shapes: [Box],
})

describe('TLTestApp', () => {
  it('resets', () => {
    const app = new TLTestApp().reset()
    expect(app.document).toMatchObject({
      shapes: [],
    })
  })
})

describe('When creating the app', () => {
  it('creates an app with an empty state if no initial state is provided.', () => {
    const app = new TLApp()
    expect(app.document).toMatchObject({
      shapes: [],
    })
    expect(app.userState).toMatchObject({
      camera: [0, 0, 1],
      isToolLocked: false,
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
      },
      shapes: [Box],
    })
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
        },
      ],
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

/* -------------------------------------------------- */
/*                      TLApp API                     */
/* -------------------------------------------------- */

describe('TLApp.selectShapes', () => {
  it('Selects a shape', () => {
    const app = new TLTestApp()
    app.selectShapes(['box1']).expectSelectedIdsToBe(['box1'])
  })
})

describe('TLApp.getShape', () => {
  it('Gets a shape by its ID', () => {
    const app = testApp.clone()
    const box = app.getShape('box1')
    expect(box).toBeInstanceOf(Box)
  })

  it('Throws error if shape is not found', () => {
    const app = testApp.clone()
    expect(() => app.getShape('missingBox')).toThrowError(`Shape "missingBox" not found.`)
  })
})

describe('TLApp.getShapeModel', () => {
  it('Gets a shape model by its ID', () => {
    const app = testApp.clone()
    const box = app.getShapeModel('box1')
    expect(box).toMatchObject({
      id: 'box1',
      type: 'box',
      point: [0, 0],
    })
  })

  it('Throws error if shape is not found', () => {
    const app = testApp.clone()
    expect(() => app.getShapeModel('missingBox')).toThrowError(`Shape "missingBox" not found.`)
  })
})

describe('TLApp.addShapes', () => {
  it('Adds new shapes to the model.', () => {
    const app = new TLTestApp().reset()
    expect(app.document.shapes.length).toBe(0)
    app.addShapes([
      {
        id: 'box2',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      },
    ])
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box2',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
      ],
    })
    expect(app.document.shapes.length).toBe(1)
    app.addShapes([
      {
        id: 'box3',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      },
    ])
    expect(app.document.shapes.length).toBe(2)
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box2',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
        {
          id: 'box3',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
      ],
    })
  })

  it('Adds new TLShapes instances', () => {
    const app = new TLTestApp().reset()
    app.addShapes([
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      },
    ])
    expect(app.shapes.size).toBe(1)
    expect(app.shapes.get('box1')).toBeInstanceOf(TLBoxShape)
    expect(app.shapes.get('box1')!.model).toMatchObject({
      id: 'box1',
      type: 'box',
      point: [0, 0],
      size: [100, 100],
    })
  })

  it('Throws error if a TLShapeConstructor is not found for a shape', () => {
    const app = new TLTestApp().reset()
    const err = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(err)
    expect(() =>
      app.addShapes([
        {
          id: 'box2',
          type: 'missingType',
          point: [0, 0],
        },
      ])
    ).toThrowError()
    expect(err).toHaveBeenCalled()
  })
})

describe('TLApp.updateShapes', () => {
  it('Updates the shapes in the model', () => {
    const app = new TLTestApp()
      .reset()
      .addShapes([
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .updateShapes([
        {
          id: 'box1',
          point: [1, 1],
        },
      ])
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [1, 1],
          size: [100, 100],
        },
      ],
    })
  })
})

describe('TLApp.deleteShapes', () => {
  it('Removes the shapes', () => {
    const app = new TLTestApp().reset().addShapes([
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      },
    ])
    app.deleteShape('box1')
    expect(app.document).toMatchObject({
      shapes: [],
    })
    expect(app.shapes.size).toBe(0)
  })

  it('Removes all shapes', () => {
    const app = new TLTestApp().reset().addShapes([
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      },
    ])
    app.reset()
    expect(app.document).toMatchObject({
      shapes: [],
    })
    expect(app.shapes.size).toBe(0)
  })

  it('Removes the selected shape when deleting a shape', () => {
    const app = new TLTestApp().reset().addShapes([
      {
        id: 'box1',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      },
    ])
    app.selectShapes(['box1']).deleteShapes([app.getShape('box1')])
    expect(app.document).toMatchObject({
      shapes: [],
    })
    expect(app.shapes.size).toBe(0)
  })
})

describe('userState.brush', () => {
  it('Sets brush when passed a bounding box', () => {
    const app = new TLTestApp()
    app.updateUserState({
      brush: {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100,
        width: 100,
        height: 100,
      },
    })
    expect(app.userState.brush).toMatchObject({
      minX: 0,
      maxX: 100,
      minY: 0,
      maxY: 100,
      width: 100,
      height: 100,
    })
  })

  it('Clears brush when passed undefined', () => {
    const app = new TLTestApp()
    app.updateUserState({
      brush: {
        minX: 0,
        maxX: 100,
        minY: 0,
        maxY: 100,
        width: 100,
        height: 100,
      },
    })
    app.updateUserState({ brush: undefined })
    expect(app.userState.brush).toBeUndefined()
  })
})

describe('TLApp.loadDocument', () => {
  it('Loads a document model', () => {
    const app = new TLTestApp()
    app.loadDocument({
      shapes: [
        {
          id: 'jbox',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
      ],
    })
    expect(app.getShape('jbox')).toBeDefined()
    // expect(app.selectedIds).toMatchObject(['jbox'])
    // expect(app.selectedShapesArray[0]).toBe(app.getShape('jbox'))
  })

  it('Fails with warning if given a malformed document', () => {
    const app = new TLTestApp()
    const warn = jest.fn()
    jest.spyOn(console, 'error').mockImplementation(warn)
    app.loadDocument({
      selectedIds: [],
      // @ts-expect-error - we're testing the warning
      shapes: 'frog dog',
    })
    expect(warn).toHaveBeenCalled()
  })
})
