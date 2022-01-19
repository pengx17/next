import Vec from '@tldraw/vec'
import { computed, makeObservable } from 'mobx'
import { BoundsUtils } from '~utils'
import type { TLApp, TLShape } from '.'
import type { TLBounds, TLEventMap } from './_types'

export class TLDisplayManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
    makeObservable(this)
  }

  @computed get shapesInViewport(): S[] {
    const {
      document: { shapes },
      selectedShapes,
      viewport: { currentView },
    } = this.app
    return shapes
      .map(shape => this.app.getShape(shape.id))
      .filter(shape => {
        return (
          shape.model.parentId === undefined &&
          (!shape.canUnmount ||
            selectedShapes.has(shape) ||
            BoundsUtils.boundsContain(currentView, shape.rotatedBounds) ||
            BoundsUtils.boundsCollide(currentView, shape.rotatedBounds))
        )
      })
  }

  @computed get selectionDirectionHint(): number[] | undefined {
    const {
      selectionBounds,
      viewport: { currentView },
    } = this.app
    if (
      !selectionBounds ||
      BoundsUtils.boundsContain(currentView, selectionBounds) ||
      BoundsUtils.boundsCollide(currentView, selectionBounds)
    ) {
      return
    }
    const center = BoundsUtils.getBoundsCenter(selectionBounds)
    return Vec.clampV(
      [
        (center[0] - currentView.minX - currentView.width / 2) / currentView.width,
        (center[1] - currentView.minY - currentView.height / 2) / currentView.height,
      ],
      -1,
      1
    )
  }

  @computed get showSelection() {
    const { selectedShapesArray } = this.app
    return (
      this.app.isIn('select') &&
      ((selectedShapesArray.length === 1 && !selectedShapesArray[0]?.hideSelection) ||
        selectedShapesArray.length > 1)
    )
  }

  @computed get showSelectionDetail() {
    const { selectedShapes, selectedShapesArray } = this.app
    return (
      this.app.isIn('select') &&
      selectedShapes.size > 0 &&
      !selectedShapesArray.every(shape => shape.hideSelectionDetail)
    )
  }

  @computed get showSelectionRotation() {
    return (
      this.showSelectionDetail && this.app.isInAny('select.rotating', 'select.pointingRotateHandle')
    )
  }

  @computed get showContextBar() {
    const {
      selectedShapesArray,
      inputs: { ctrlKey },
    } = this.app
    return (
      !ctrlKey &&
      this.app.isInAny('select.idle', 'select.hoveringSelectionHandle') &&
      selectedShapesArray.length > 0 &&
      !selectedShapesArray.every(shape => shape.hideContextBar)
    )
  }

  @computed get showRotateHandles() {
    const { selectedShapesArray } = this.app
    return (
      this.app.isInAny(
        'select.idle',
        'select.hoveringSelectionHandle',
        'select.pointingRotateHandle',
        'select.pointingResizeHandle'
      ) &&
      selectedShapesArray.length > 0 &&
      !selectedShapesArray.every(shape => shape.hideRotateHandle)
    )
  }

  @computed get showResizeHandles() {
    const { selectedShapesArray } = this.app
    return (
      this.app.isInAny(
        'select.idle',
        'select.hoveringSelectionHandle',
        'select.pointingShape',
        'select.pointingSelectedShape',
        'select.pointingRotateHandle',
        'select.pointingResizeHandle'
      ) &&
      selectedShapesArray.length > 0 &&
      !selectedShapesArray.every(shape => shape.hideResizeHandles)
    )
  }
}
