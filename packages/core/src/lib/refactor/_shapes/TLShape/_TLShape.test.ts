/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* -------------------------------------------------- */
/*                       TLShape                      */
/* -------------------------------------------------- */

import { testApp } from '../../tests/shared'

describe('TLShape.clone', () => {
  it('Adds new shapes', () => {
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
      selectedIds: [],
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
      selectedIds: [],
    })
  })
})

describe('TLShape.update', () => {
  it('Updates the shape in the model', () => {
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
      selectedIds: [],
    })
  })
})

describe('TLShape.delete', () => {
  it('Removes the shape', () => {
    const app = testApp.clone()
    const box = app.getShape('box1')
    box.delete()
    expect(app.document).toMatchObject({
      shapes: [],
      selectedIds: [],
    })
    expect(app.shapes.size).toBe(0)
  })
})
