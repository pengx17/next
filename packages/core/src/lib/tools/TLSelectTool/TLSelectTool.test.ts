import { TLBoxShape, TLBoxShapeModel } from '~lib'
import { TLTestApp } from '~test'
import { TLTargetType } from '~types'
import { TLBoxTool } from '..'

describe('When in the idle state', () => {
  it('Clears selected shapes when Escape is pressed', () => {
    new TLTestApp()
      .selectShapes(['box1'])
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

describe('When brushing', () => {
  it('Selects shapes inside the brush', () => {
    new TLTestApp()
      .selectTool('select')
      // Point on empty canvas
      .pointerDown([-100, -100])
      .expectToBeIn('select.pointingCanvas')
      // Move to touch neither box 1 or 2, expect neither box to be selected
      .pointerMove([-150, -150])
      .expectToBeIn('select.brushing')
      .expectSelectedIdsToBe([])
      // Move to touch box 1, expect box 1 to be selected
      .pointerMove([100, 100])
      .expectSelectedIdsToBe(['box1'])
      // Move to touch box 2, expect box 2 to be selected
      .pointerMove([300, 300])
      .expectSelectedIdsToBe(['box1', 'box2'])
      // Move to touch box 1, expect box 1 to be selected
      .pointerMove([100, 100])
      .expectSelectedIdsToBe(['box1'])
      .pointerUp([100, 100])
      .expectToBeIn('select.idle')
      .expectSelectedIdsToBe(['box1'])
  })

  it('Enters push mode / preserves initial selection when shift is pressed', () => {
    new TLTestApp()
      // Select box 2
      .select('box2')
      .selectTool('select')
      // Point on empty canvas
      .pointerDown([-100, -100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectToBeIn('select.pointingCanvas')
      // Move to touch neither box 1 or 2, expect box 2 to be selected
      .pointerMove([-150, -150], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectToBeIn('select.brushing')
      .expectSelectedIdsToBe(['box2'])
      // Move to touch box 1, expect box 1 and 2 to be selected
      .pointerMove([100, 100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectSelectedIdsToBe(['box2', 'box1'])
      // Move to touch box 1 and box 2, expect box 1 and 2 to be selected
      .pointerMove([300, 300], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectSelectedIdsToBe(['box2', 'box1'])
      // Move to touch neither box, expect 2 to be selected
      .pointerMove([-100, -100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectSelectedIdsToBe(['box2'])
      // Move to touch box 1 and box 2, expect 2 to be selected
      .pointerMove([100, 100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectSelectedIdsToBe(['box2', 'box1'])
      .pointerUp([100, 100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectToBeIn('select.idle')
      .expectSelectedIdsToBe(['box2', 'box1'])
  })

  it('Toggles between push mode when shift is pressed / released', () => {
    new TLTestApp()
      // Select box 2
      .select('box2')
      .selectTool('select')
      // Point on empty canvas
      .pointerDown([-100, -100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectToBeIn('select.pointingCanvas')
      // Move to touch neither box 1 or 2, expect box 2 to be selected
      .pointerMove([-150, -150], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectToBeIn('select.brushing')
      .expectSelectedIdsToBe(['box2'])
      // Move to touch box 1, expect box 1 and 2 to be selected
      .pointerMove([100, 100], { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectSelectedIdsToBe(['box2', 'box1'])
      // Release shift, leave push mode, expect box 1 to be selected
      .keyUp('Shift', { type: TLTargetType.Canvas }, { shiftKey: false })
      .expectSelectedIdsToBe(['box1'])
      // Press shift, return to push mode, expect box 1 and box 2 to be selected
      .keyDown('Shift', { type: TLTargetType.Canvas }, { shiftKey: true })
      .expectSelectedIdsToBe(['box2', 'box1'])
  })

  it('Enters contain mode when ctrl is pressed', () => {
    new TLTestApp()
      .selectTool('select')
      // Point on empty canvas
      .pointerDown([-100, -100], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectToBeIn('select.pointingCanvas')
      // Move to touch neither box 1 or 2
      .pointerMove([-150, -150], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectToBeIn('select.brushing')
      .expectSelectedIdsToBe([])
      // Move to touch box 1 but not contain it, not touching box 2
      .pointerMove([100, 100], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe([])
      // Move to contain box 1, touch but not contain box 2
      .pointerMove([300, 300], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe(['box1'])
      // Move to contain both box 1 and box 2
      .pointerMove([400, 400], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe(['box1', 'box2'])
      // Move back to contain box 1, touch but not contain box 2
      .pointerMove([300, 300], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe(['box1'])
      // Pointer up while still holding ctrl
      .pointerUp([300, 300], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectToBeIn('select.idle')
      .expectSelectedIdsToBe(['box1'])
  })

  it('Toggles between contain mode when ctrl is pressed / released', () => {
    new TLTestApp()
      .selectTool('select')
      // Point on empty canvas
      .pointerDown([-100, -100], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectToBeIn('select.pointingCanvas')
      // Move to touch neither box 1 or 2
      .pointerMove([-150, -150], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectToBeIn('select.brushing')
      .expectSelectedIdsToBe([])
      // Move to touch box 1 but not contain it, not touching box 2
      .pointerMove([100, 100], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe([])
      // Move to contain box 1, touch but not contain box 2
      .pointerMove([300, 300], { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe(['box1'])
      // Release ctrl key, exit contain mode; should select both boxes
      .keyUp('Ctrl', { type: TLTargetType.Canvas }, { ctrlKey: false })
      .expectSelectedIdsToBe(['box1', 'box2'])
      // Press ctrl key, exit contain mode; should be back to only box1
      .keyDown('Ctrl', { type: TLTargetType.Canvas }, { ctrlKey: true })
      .expectSelectedIdsToBe(['box1'])
  })

  it('Restores initial selection when Escape is pressed', () => {
    new TLTestApp()
      .selectTool('select')
      // Point on empty canvas
      .pointerDown([-100, -100])
      .expectToBeIn('select.pointingCanvas')
      // Move to touch box 1, expect box 1 to be selected
      .pointerMove([100, 100])
      .expectToBeIn('select.brushing')
      .expectSelectedIdsToBe(['box1'])
      // Press Escape key, expect no selection and to be in idle state
      .keyDown('Escape')
      .expectToBeIn('select.idle')
      .expectSelectedIdsToBe([])
      // Pointer up should have no effect here
      .pointerUp([100, 100])
      .expectToBeIn('select.idle')
      .expectSelectedIdsToBe([])
  })
})
