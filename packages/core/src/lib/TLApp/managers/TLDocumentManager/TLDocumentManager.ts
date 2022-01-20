import Vec from '@tldraw/vec'
import { action, autorun, makeObservable, observe, transaction } from 'mobx'
import { deepObserve } from 'mobx-utils'
import type { TLApp, TLDocumentModel, TLShape, TLUserState } from '~lib'
import type { TLEventMap } from '~types'
import { BoundsUtils, uniqueId } from '~utils'

export class TLDocumentManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  state: 'stopped' | 'running' = 'stopped'

  disposables: (() => void)[] = []

  constructor(app: TLApp<S, K>) {
    this.app = app
    // makeObservable(this)
  }

  // Consider adding reactions to document.shapes changes, to remove
  // missing shapes from erasingIds or selectedIds, etc. We want to
  // provide only one "source of truth" for which shapes exist in the
  // document.

  // setSelectedShapes = () => {
  //   const {
  //     document: { selectedIds },
  //   } = this.app
  //   const selectedShapesArray = selectedIds.map(id => this.app.getShape(id))
  //   this.app.updateUserState({
  //     selectedShapesArray,
  //     selectedShapes: new Set(selectedShapesArray),
  //   })
  // }

  // setShapes = () => {
  //   const {
  //     shapes,
  //     document: { shapes: models },
  //   } = this.app
  //   const toCreate = new Set(models)
  //   const toDelete = new Set<string>(shapes.keys())
  //   const shapesToCreate: S['model'][] = []
  //   models.forEach(model => {
  //     if (shapes.has(model.id)) {
  //       // The model already has a shapes
  //       toCreate.delete(model)
  //       toDelete.delete(model.id)
  //       return
  //     }
  //     // The model is new, so it needs a shape
  //     shapesToCreate.push(model)
  //   })
  //   const idsToDelete = Array.from(toDelete.values())
  //   transaction(() => {
  //     if (shapesToCreate.length) this.app.createShapes(shapesToCreate)
  //     if (idsToDelete.length) {
  //       // this.removeShapes(idsToDelete)
  //       this.app.deselectShapes(idsToDelete)
  //     }
  //   })
  // }

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

  processSelectionChanges = () => {
    const {
      userState: { selectedIds },
    } = this.app
    this.app.updateUserState(userState => {
      userState.selectedShapesArray = selectedIds.map(id => this.app.getShape(id))
      userState.selectedShapes = new Set(userState.selectedShapesArray)
    })
  }

  processDisplayChanges = () => {
    const {
      userState: { ctrlKey },
      selectedShapes,
      selectedShapesArray,
      selectionBounds,
      currentView,
    } = this.app

    // const shapesInViewport = shapes
    //   .map(shape => this.app.getShape(shape.id))
    //   .filter(shape => {
    //     return (
    //       shape.model.parentId === undefined &&
    //       (!shape.canUnmount ||
    //         selectedShapes.has(shape) ||
    //         BoundsUtils.boundsContain(currentView, shape.rotatedBounds) ||
    //         BoundsUtils.boundsCollide(currentView, shape.rotatedBounds))
    //     )
    //   })

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
          ctrlKey &&
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
    this.app.updateDisplayState({
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
    this.disposables.push(
      autorun(this.processDocumentChanges),
      autorun(this.processSelectionChanges)
      // autorun(this.setShapes)
    )
    this.state = 'running'
  }

  stop = () => {
    this.disposables.forEach(disposable => disposable())
    this.disposables = []
    this.state = 'stopped'
  }
}
