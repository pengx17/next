/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLApp } from './TLApp'
import { Box, TLTestApp, testApp } from '~test'

describe('When creating the app', () => {
  it('creates an app with an empty state if no initial state is provided.', () => {
    const app = new TLApp()
    expect(app.document).toMatchObject({
      shapes: [],
      selectedIds: [],
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
        selectedIds: [],
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
      selectedIds: [],
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
        selectedIds: [],
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
      selectedIds: [],
    })
  })

  it('Adds new TLShapes instances', () => {
    const app = testApp.clone()
    app.addShapes([
      {
        id: 'box2',
        type: 'box',
        point: [0, 0],
      },
    ])
    expect(app.shapes.size).toBe(2)
    expect(app.shapes.get('box2')).toBeInstanceOf(Box)
    expect(app.shapes.get('box2')!.model).toMatchObject({
      id: 'box2',
      type: 'box',
      point: [0, 0],
    })
  })

  it('Throws error if a TLShapeConstructor is not found for a shape', () => {
    const app = testApp.clone()
    expect(() =>
      app.addShapes([
        {
          id: 'box2',
          // @ts-expect-error
          type: 'missingType',
          point: [0, 0],
        },
      ])
    ).toThrowError(`Shape type "missingType" is not registered.`)
  })
})

describe('TLApp.updateShapes', () => {
  it('Updates the shapes in the model', () => {
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
      selectedIds: [],
    })
  })
})

describe('TLApp.deleteShapes', () => {
  it('Removes the shapes', () => {
    const app = testApp.clone()
    const boxModel = app.getShapeModel('box1')
    app.deleteShapes([boxModel])
    expect(app.document).toMatchObject({
      shapes: [],
      selectedIds: [],
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
      selectedIds: ['jbox'],
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
    expect(app.selectedIds).toMatchObject(['jbox'])
    expect(app.selectedShapesArray[0]).toBe(app.getShape('jbox'))
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
