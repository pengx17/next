import Vec from '@tldraw/vec'
import { autorun } from 'mobx'
import type { TLApp, TLShape } from '~lib'
import type { TLEventMap } from '~types'
import { BoundsUtils } from '~utils'

export class TLUserStateManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  state: 'stopped' | 'running' = 'stopped'

  disposables: (() => void)[] = []

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  processDocumentChanges = () => {
    const {
      document: { shapes },
    } = this.app

    let didUpdate = false
    const toDelete: string[] = []
    const toCreate: S['model'][] = []

    // Find which shapes need to be created or deleted, based on the document.shapes models
    const idsRemaining = new Set(Array.from(this.app.shapes.keys()))

    for (const model of shapes) {
      if (this.app.shapes.has(model.id)) {
        idsRemaining.delete(model.id)
        continue
      }
      didUpdate = true
      toCreate.push(model)
    }

    if (idsRemaining.size > 0) {
      didUpdate = true
      toDelete.push(...Array.from(idsRemaining.values()))
    }

    if (didUpdate) {
      this.app.updateUserState(userState => {
        if (toCreate.length > 0) {
          toCreate.forEach(model => {
            const ShapeCtor = this.app.getShapeConstructor(model)
            userState.shapes.set(model.id, new ShapeCtor(this.app, model.id))
          })
        }

        if (toDelete.length > 0) {
          toDelete.forEach(id => {
            this.app.selectedIds.splice(this.app.selectedIds.indexOf(id), 1)
            this.app.shapes.delete(id)
          })
        }
      })
    }
  }

  processDisplayChanges = () => {
    const {
      userState: { ctrlKey },
      selectedShapes,
      selectedShapesArray,
      selectionBounds,
      currentView,
    } = this.app

    let selectionDirectionHint: number[] | undefined
    let showSelection = false
    let showContextBar = false
    let showRotateHandles = false
    let showResizeHandles = false
    let showSelectionRotation = false
    let showSelectionDetail = false

    if (selectedShapes.size > 0) {
      if (this.app.isIn('select')) {
        if (
          selectionBounds &&
          !(
            BoundsUtils.boundsContain(currentView, selectionBounds) ||
            BoundsUtils.boundsCollide(currentView, selectionBounds)
          )
        ) {
          const [cx, cy] = BoundsUtils.getBoundsCenter(selectionBounds)
          const { minX, minY, width, height } = currentView
          selectionDirectionHint = Vec.clampV(
            [(cx - minX - width / 2) / width, (cy - minY - height / 2) / height],
            -1,
            1
          )
        }

        if (
          (selectedShapes.size === 1 && !selectedShapesArray[0]?.hideSelection) ||
          selectedShapesArray.length > 1
        ) {
          showSelection = true
        }

        if (!selectedShapesArray.every(shape => shape.hideSelectionDetail)) {
          showSelectionDetail = true
          if (this.app.isInAny('select.rotating', 'select.pointingRotateHandle')) {
            showSelectionRotation = true
          }
        }

        if (
          !ctrlKey &&
          this.app.isInAny('select.idle', 'select.hoveringSelectionHandle') &&
          !selectedShapesArray.every(shape => shape.hideContextBar)
        ) {
          showContextBar = true
        }

        if (
          !selectedShapesArray.every(shape => shape.hideRotateHandle) &&
          this.app.isInAny(
            'select.idle',
            'select.hoveringSelectionHandle',
            'select.pointingRotateHandle',
            'select.pointingResizeHandle'
          )
        ) {
          showRotateHandles = true
        }

        if (
          !selectedShapesArray.every(shape => shape.hideResizeHandles) &&
          this.app.isInAny(
            'select.idle',
            'select.hoveringSelectionHandle',
            'select.pointingShape',
            'select.pointingSelectedShape',
            'select.pointingRotateHandle',
            'select.pointingResizeHandle'
          )
        ) {
          showResizeHandles = true
        }
      }
    }

    this.app.updateUserState({
      showSelection,
      showSelectionRotation,
      showSelectionDetail,
      showContextBar,
      showRotateHandles,
      showResizeHandles,
      selectionDirectionHint,
    })
  }

  start = () => {
    this.disposables.push(autorun(this.processDocumentChanges), autorun(this.processDisplayChanges))
    this.state = 'running'
  }

  stop = () => {
    this.disposables.forEach(disposable => disposable())
    this.disposables = []
    this.state = 'stopped'
  }
}
