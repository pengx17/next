/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLApp } from './_TLApp'
import { Box, testApp } from './tests/shared'

describe('When creating the app', () => {
  it('creates an app with an empty state if no initial state is provided.', () => {
    const app = new TLApp()
    expect(app.document).toMatchObject({
      shapes: [],
      selectedIds: [],
    })
    expect(app.appState).toMatchObject({
      camera: [0, 0, 1],
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

describe('TLApp history', () => {
  it('Does change, undo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Does change, undo, redo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })

  it('Does change, undo, undo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.undo()
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Does change, change, undo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })

  it('Does change, change, undo, undo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([0, 0])
  })

  it('Does change, change, undo, change, undo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.getShape('box1').update({ point: [3, 3] })
    app.undo()
    expect(app.getShape('box1').model.point).toMatchObject([1, 1])
  })

  it('Does change, undo, redo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })

  it('Does change, change, undo, undo, redo, redo', () => {
    const app = testApp.clone()
    app.debug = true
    app.getShape('box1').update({ point: [1, 1] })
    app.getShape('box1').update({ point: [2, 2] })
    app.undo()
    app.undo()
    app.redo()
    app.redo()
    expect(app.getShape('box1').model.point).toMatchObject([2, 2])
  })
})
