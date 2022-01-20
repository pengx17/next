/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* -------------------------------------------------- */
/*                       TLShape                      */
/* -------------------------------------------------- */

import { TLTestApp } from '~test'

describe('TLShape.clone', () => {
  it('Adds new shapes', () => {
    const app = new TLTestApp()
    app
      .deleteShapes([...app.document.shapes])
      .createShape({
        id: 'box1',
        type: 'box',
        point: [0, 0],
        size: [100, 100],
      })
      .getShape('box1')
      .clone('box1clone1')
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
        {
          id: 'box1clone1',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
      ],
    })
  })

  it('Adds the new shape above the cloned shape', () => {
    const app = new TLTestApp()
    app.reset().createShape({
      id: 'box1',
      type: 'box',
      point: [0, 0],
      size: [100, 100],
    })
    app.getShape('box1').clone('box1clone1')
    app.getShape('box1').clone('box1clone2')
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
        {
          id: 'box1clone2',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
        {
          id: 'box1clone1',
          type: 'box',
          point: [0, 0],
          size: [100, 100],
        },
      ],
    })
  })
})

describe('TLShape.update', () => {
  it('Updates the shape in the model', () => {
    const app = new TLTestApp()
    app.reset().createShape({
      id: 'box1',
      type: 'box',
      point: [0, 0],
      size: [100, 100],
    })
    const box = app.shapes.get('box1')!
    box.update({ point: [2, 2] })
    expect(app.document).toMatchObject({
      shapes: [
        {
          id: 'box1',
          type: 'box',
          point: [2, 2],
          size: [100, 100],
        },
      ],
    })
  })
})

describe('TLShape.delete', () => {
  it('Removes the shape', () => {
    const app = new TLTestApp()
    app.reset()
    expect(app.document).toMatchObject({
      shapes: [],
    })
    expect(app.shapes.size).toBe(0)
  })
})
