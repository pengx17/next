/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import Vec from '@tldraw/vec'
import { TLBoxShape, TLBoxShapeModel } from '~lib'
import { BoxShape } from '~lib/shapes/TLBoxShape/TLBoxShape.test'
import { TLTestApp } from '~test'
import { TLResizeCorner, TLRotateCorner, TLTargetType } from '~types'

const testApp = new TLTestApp()

function compareArrays<T>(a: T[], b: T[]) {
  expect(a.length).toBe(b.length)
  for (let i = 0; i < a.length; i++) {
    expect(a[i]).toBe(b[i])
  }
}

describe('TLDisplayManager.setShapesInViewport', () => {
  it('Sets shapes in viewport', () => {
    const app = testApp.clone()
    compareArrays(app.displayState.shapesInViewport, app.getShapes(['box1', 'box2', 'box3']))
    app.setCamera([-150, 0, 1])
    compareArrays(app.displayState.shapesInViewport, app.getShapes(['box2', 'box3']))
    app.setCamera([-550, 0, 1])
    compareArrays(app.displayState.shapesInViewport, app.getShapes([]))
    app.setCamera([0, 0, 5])
    compareArrays(app.displayState.shapesInViewport, app.getShapes(['box1']))
    app.setCamera([0, 0, 1])
    compareArrays(app.displayState.shapesInViewport, app.getShapes(['box1', 'box2', 'box3']))
  })
})

describe('TLDisplayManager.setDirectionHint', () => {
  it('Is undefined when the selection is on screen', () => {
    const app = testApp.clone().selectShapes(['box1'])
    expect(app.displayState.selectionDirectionHint).toBeUndefined()
    app.setCamera([-150, 0, 1])
    expect(app.displayState.selectionDirectionHint).toBeDefined()
    expect(Vec.toFixed(app.displayState.selectionDirectionHint!, 2)).toMatchObject([-0.59, -0.43])
  })

  it('Is positioned correctly when the bounds are non-zero', () => {
    const app = testApp.clone().selectShapes(['box1'])
    app.viewport.updateBounds({
      minX: 100,
      minY: 100,
      maxX: 1180,
      maxY: 820,
      width: 1080,
      height: 720,
    })
    app.setCamera([-150, 0, 1])
    expect(Vec.toFixed(app.displayState.selectionDirectionHint!, 2)).toMatchObject([-0.59, -0.43])
  })
})

describe('TLDisplayManager..showSelection', () => {
  it('Shows selection only if the select tool is active and there are selected shapes', () => {
    const app = testApp.clone().selectShapes(['box1'])
    expect(app.displayState.showSelection).toBe(true)
  })
  it.todo('Hides selection if the only selected shape has hideSelection=true')
  it.todo('Shows when more than one shape is selected, even if some/all have hideSelection=true')
})

describe('app.showSelectionDetail', () => {
  it.todo('Shows detail only if the select tool is active and there are selected shapes')
  it.todo('Hides detail if all selected shapes have hideSelection=true')
  it.todo('Shows when more than one shape is selected, even if some/all have hideSelection=true')
})

describe('app.showSelectionRotation', () => {
  it.todo('Shows rotation only if showing selection detail')
  it.todo('Shows rotation only if select tool is in rotating or pointingRotateHandle state')
})

describe('app.showContextBar', () => {
  it('Hides context bar when there are no shapes selected', () => {
    new TLTestApp().selectShapes([]).expectDisplayStateToBe({ showContextBar: false })
  })

  it('Shows context bar if any of the selected shapes has hideContextBar=false', () => {
    new TLTestApp().selectShapes(['box1']).expectDisplayStateToBe({ showContextBar: true })
  })

  it('Shows context bar if some selected shapes have hideContextBar=true', () => {
    class TLNoContextBarBoxShape extends TLBoxShape<TLBoxShapeModel> {
      static type = 'nocontextbarbox'
      hideContextBar = true
    }
    new TLTestApp()
      .registerShapes([TLNoContextBarBoxShape])
      .createShapes([
        {
          id: 'nocontextbarbox1',
          type: 'nocontextbarbox',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .selectShapes(['box1', 'nocontextbarbox1'])
      .expectDisplayStateToBe({ showContextBar: true })
  })

  it('Hides context bar if all selected shapes have hideContextBar=true', () => {
    class TLNoContextBarBoxShape extends TLBoxShape<TLBoxShapeModel> {
      static type = 'nocontextbarbox'
      hideContextBar = true
    }

    new TLTestApp()
      .registerShapes([TLNoContextBarBoxShape])
      .createShapes([
        {
          id: 'nocontextbarbox1',
          type: 'nocontextbarbox',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .selectShapes(['nocontextbarbox1'])
      .expectDisplayStateToBe({ showContextBar: false })
  })

  it('Hides context bar when the state is not select.idle/hoveringSelectionHandle', () => {
    const app = new TLTestApp()
    app
      .selectShapes(['box1'])
      .expectToBeIn('select.idle')
      .expectDisplayStateToBe({ showContextBar: true })
      .pointerDown([0, 0], 'box1')
      .expectToBeIn('select.pointingSelectedShape')
      .expectDisplayStateToBe({ showContextBar: false })
      .pointerUp([0, 0], 'box1')
      .expectToBeIn('select.idle')
      .expectDisplayStateToBe({ showContextBar: true })
      .pointerEnter([0, 0], {
        type: TLTargetType.Selection,
        handle: TLResizeCorner.TopLeft,
      })
      .expectToBeIn('select.hoveringSelectionHandle')
      .expectDisplayStateToBe({ showContextBar: true })
      .pointerLeave([0, 0], {
        type: TLTargetType.Selection,
        handle: TLResizeCorner.TopLeft,
      })
      .pointerDown([-10, -10], { type: TLTargetType.Canvas })
      .expectToBeIn('select.pointingCanvas')
      .expectDisplayStateToBe({ showContextBar: false })
  })
})

// Resize handles

describe('TLDisplayManager.showResizeHandles', () => {
  it('Hides resize handles when there are no shapes selected', () => {
    new TLTestApp().selectShapes([]).expectDisplayStateToBe({ showResizeHandles: false })
  })

  it('Shows resize handles if any of the selected shapes has hideResizeHandles=false', () => {
    class TLNoHandlesBoxShape extends BoxShape {
      static type = 'noresizehandlesbox'
      hideResizeHandles = true
    }
    new TLTestApp()
      .selectShapes(['box1'])
      .expectDisplayStateToBe({ showResizeHandles: true })
      .registerShapes([TLNoHandlesBoxShape])
      .createShapes([
        {
          id: 'noresizehandlesbox1',
          type: 'noresizehandlesbox',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .selectShapes(['box1', 'noresizehandlesbox1'])
      .expectDisplayStateToBe({ showResizeHandles: true })
  })

  it('Hides resize handles if there is a selected shape with hideResizeHandles=true', () => {
    class TLNoHandlesBoxShape extends BoxShape {
      static type = 'noresizehandlesbox'
      hideResizeHandles = true
    }
    new TLTestApp()
      .registerShapes([TLNoHandlesBoxShape])
      .createShapes([
        {
          id: 'noresizehandlesbox1',
          type: 'noresizehandlesbox',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .selectShapes(['noresizehandlesbox1'])
      .expectDisplayStateToBe({ showResizeHandles: false })
  })

  it('Hides resize handles when the state is not select.idle/hoveringSelectionHandle/pointingResizeHandle/pointingRotateHandle', () => {
    new TLTestApp()
      .selectShapes(['box1'])
      .expectToBeIn('select.idle')
      .expectDisplayStateToBe({ showResizeHandles: true })
      .pointerDown([0, 0], 'box1')
      .expectToBeIn('select.pointingSelectedShape')
      .expectDisplayStateToBe({ showResizeHandles: true })
      .pointerUp([0, 0], 'box1')
      .expectToBeIn('select.idle')
      .expectDisplayStateToBe({ showResizeHandles: true })
      .pointerEnter([0, 0], {
        type: TLTargetType.Selection,
        handle: TLResizeCorner.TopLeft,
      })
      .expectToBeIn('select.hoveringSelectionHandle')
      .expectDisplayStateToBe({ showResizeHandles: true })
      .pointerDown([0, 0], {
        type: TLTargetType.Selection,
        handle: TLResizeCorner.TopLeft,
      })
      .expectToBeIn('select.pointingResizeHandle')
      .expectDisplayStateToBe({ showResizeHandles: true })
      .pointerUp([0, 0], {
        type: TLTargetType.Selection,
        handle: TLResizeCorner.TopLeft,
      })
      .pointerLeave([0, 0], {
        type: TLTargetType.Selection,
        handle: TLResizeCorner.TopLeft,
      })
      // test rotate handle
      .pointerDown([-10, -10], { type: TLTargetType.Canvas })
      .expectToBeIn('select.pointingCanvas')
      .expectDisplayStateToBe({ showResizeHandles: false })
  })
})

describe('app.showRotateHandles', () => {
  it('Hides rotate handle when there are no shapes selected', () => {
    new TLTestApp().selectShapes([]).expectDisplayStateToBe({ showRotateHandles: false })
  })

  it('Shows rotate handle if any of the selected shapes has hideRotateHandle=false', () => {
    class TLNoRotateHandleBoxShape extends BoxShape {
      static type = 'norotatehandlesbox'
      hideRotateHandle = true
    }
    new TLTestApp()
      .selectShapes(['box1'])
      .expectDisplayStateToBe({ showRotateHandles: true })
      .registerShapes([TLNoRotateHandleBoxShape])
      .createShapes([
        {
          id: 'norotatehandlesbox1',
          type: 'norotatehandlesbox',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .selectShapes(['box1', 'norotatehandlesbox1'])
      .expectDisplayStateToBe({ showRotateHandles: true })
  })

  it('Hides rotate handle if there is a selected shape with hideRotateHandles=true', () => {
    class TLNoRotateHandleBoxShape extends BoxShape {
      static type = 'norotatehandlesbox'
      hideRotateHandle = true
    }
    new TLTestApp()
      .registerShapes([TLNoRotateHandleBoxShape])
      .createShapes([
        {
          id: 'norotatehandlesbox1',
          type: 'norotatehandlesbox',
          point: [0, 0],
          size: [100, 100],
        },
      ])
      .selectShapes(['norotatehandlesbox1'])
      .expectDisplayStateToBe({ showRotateHandles: false })
  })

  it('Hides rotate handles when the state is not hoveringSelectionHandle/pointingResizeHandle/pointingRotateHandle', () => {
    new TLTestApp()
      .selectShapes(['box1'])
      .expectToBeIn('select.idle')
      .expectDisplayStateToBe({ showRotateHandles: true })
      .pointerDown([0, 0], 'box1')
      .expectToBeIn('select.pointingSelectedShape')
      .expectDisplayStateToBe({ showRotateHandles: false })
      .pointerUp([0, 0], 'box1')
      .expectToBeIn('select.idle')
      .expectDisplayStateToBe({ showRotateHandles: true })
      .pointerEnter([0, 0], {
        type: TLTargetType.Selection,
        handle: 'rotate',
      })
      .expectToBeIn('select.hoveringSelectionHandle')
      .expectDisplayStateToBe({ showRotateHandles: true })
      .pointerDown([0, 0], {
        type: TLTargetType.Selection,
        handle: TLRotateCorner.TopLeft,
      })
      .expectToBeIn('select.pointingRotateHandle')
      .expectDisplayStateToBe({ showRotateHandles: true })
      .pointerUp([0, 0], {
        type: TLTargetType.Selection,
        handle: 'rotate',
      })
      .pointerLeave([0, 0], {
        type: TLTargetType.Selection,
        handle: 'rotate',
      })
      // test resize handle
      .pointerDown([-10, -10], { type: TLTargetType.Canvas })
      .expectToBeIn('select.pointingCanvas')
      .expectDisplayStateToBe({ showRotateHandles: false })
  })
})
