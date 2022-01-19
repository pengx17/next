import { TLBoxShape, TLBoxShapeModel } from '~lib'
import { TLTestApp } from '~test'
import { TLTargetType } from '~types'
import { TLBoxTool } from '..'

describe('When in the idle state', () => {
  it('Clears selected shapes when Escape is pressed', () => {
    new TLTestApp()
      .setSelectedShapes(['box1'])
      .expectSelectedIdsToBe(['box1'])
      .keyDown('Escape', { type: TLTargetType.Canvas })
      .expectSelectedIdsToBe([])
  })

  it('Sets hovered shape when entering a shape', () => {
    new TLTestApp().pointerEnter([10, 10], 'box1').expectHoveredIdToBe('box1')
  })

  it('Clears hovered shape when exiting a shape', () => {
    const app = new TLTestApp()
    app.pointerEnter([10, 10], 'box1')
    app.pointerLeave([10, 10], 'box1')
    expect(app.userState.hoveredId).toBeUndefined()
  })
})

describe('editing shape', () => {
  class TestEditableBox extends TLBoxShape<TLBoxShapeModel> {
    static type = 'editable-box'
    canEdit = true
  }

  class TestEditableBoxTool extends TLBoxTool<TLBoxShape, any> {
    static id = 'editable-box'
    static shortcut = ['x']
    Shape = TLBoxShape
  }

  it('Sets editing shape when double clicking an editable shape', () => {
    const app = new TLTestApp()
      .registerShapes([TestEditableBox])
      .registerTools([TestEditableBoxTool])
      .createShape({
        id: 'ebox',
        type: 'editable-box',
        point: [300, 300],
        size: [100, 100],
      })
      .doubleClick([310, 310], 'ebox')

    expect(app.userState.editingId).toBe('ebox')
  })

  it('Does not set editing shape when double clicking a shape that is not editable', () => {
    const app = new TLTestApp()
    app.doubleClick([10, 10], 'box1')
    expect(app.userState.editingId).toBeUndefined()
  })

  it('Clears editing shape when clicking outside of the editing shape', () => {
    const app = new TLTestApp()
      .registerShapes([TestEditableBox])
      .registerTools([TestEditableBoxTool])
      .createShape({
        id: 'ebox',
        type: 'editable-box',
        point: [300, 300],
        size: [100, 100],
      })
      .doubleClick([310, 310], 'ebox')
    app.click([-100, -110], { type: TLTargetType.Canvas })
    expect(app.userState.editingId).toBeUndefined()
  })

  it('Does not clear editing shape when clicking inside of the editing shape', () => {
    const app = new TLTestApp()
      .registerShapes([TestEditableBox])
      .registerTools([TestEditableBoxTool])
      .createShape({
        id: 'ebox',
        type: 'editable-box',
        point: [300, 300],
        size: [100, 100],
      })
      .doubleClick([310, 310], 'ebox')
      .doubleClick([310, 310], 'ebox')
    expect(app.userState.editingId).toBe('ebox')
  })
})

// export class TestEditableBox extends TLBoxShape<TLBoxShapeModel> {
//   static type = 'editable-box'
//   isEditable = true
// }

// export class TestEditableBoxTool extends TLBoxTool<TLBoxShape, any> {
//   static id = 'editable-box'
//   static shortcut = ['x']
//   Shape = TLBoxShape
// }
