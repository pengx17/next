import { Vec } from '@tldraw/vec'
import { TLApp, TLSelectTool, TLShape, TLToolState } from '~lib/refactor'
import { TLCursor, TLEventMap, TLEvents } from '~lib/refactor/_types'
import { uniqueId } from '~utils'

export class TranslatingState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'translating'
  cursor = TLCursor.Move

  private isCloning = false

  private didClone = false

  private initialPoints: Record<string, number[]> = {}

  private initialShapePoints: Record<string, number[]> = {}

  private initialClonePoints: Record<string, number[]> = {}

  private clones: S[] = []

  private moveSelectedShapesToPointer() {
    const {
      selectedShapes,
      inputs: { shiftKey, originPoint, currentPoint },
    } = this.app
    const { initialPoints } = this
    const delta = Vec.sub(currentPoint, originPoint)
    if (shiftKey) {
      if (Math.abs(delta[0]) < Math.abs(delta[1])) {
        delta[0] = 0
      } else {
        delta[1] = 0
      }
    }
    selectedShapes.forEach(shape =>
      shape.update({ point: Vec.add(initialPoints[shape.id], delta) })
    )
  }

  private startCloning() {
    const { selectedShapesArray } = this.app
    if (!this.didClone) {
      // Create the clones
      this.clones = selectedShapesArray.map(shape => {
        return shape.clone().update({
          point: this.initialPoints[shape.id],
        })
      })
      this.initialClonePoints = Object.fromEntries(
        this.clones.map(({ id, model: { point } }) => [id, point.slice()])
      )
      this.didClone = true
    }
    // Move shapes back to their start positions
    selectedShapesArray.forEach(shape => shape.update({ point: this.initialPoints[shape.id] }))
    // Set the initial points to the original clone points
    this.initialPoints = this.initialClonePoints
    // Add the clones to the page
    this.app.addShapes(this.clones)
    // Select the clones
    this.app.setSelectedShapes(Object.keys(this.initialClonePoints))
    // Move the clones to the pointer
    this.moveSelectedShapesToPointer()
    this.isCloning = true
    this.moveSelectedShapesToPointer()
  }

  onEnter = () => {
    // Pause the history when we enter
    this.app.history.pause()

    // Set initial data
    const { selectedShapesArray, inputs } = this.app

    this.initialShapePoints = Object.fromEntries(
      selectedShapesArray.map(({ id, model: { point } }) => [id, point.slice()])
    )
    this.initialPoints = this.initialShapePoints

    if (inputs.altKey) {
      this.startCloning()
    } else {
      this.moveSelectedShapesToPointer()
    }
  }

  onExit = () => {
    // Resume the history when we exit
    this.app.history.unpause()

    // Reset initial data
    this.didClone = false
    this.isCloning = false
    this.clones = []
    this.initialPoints = {}
    this.initialShapePoints = {}
    this.initialClonePoints = {}
  }

  onWheel: TLEvents<S>['wheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onPointerMove: TLEvents<S>['pointer'] = () => {
    this.moveSelectedShapesToPointer()
  }

  onPointerUp: TLEvents<S>['pointer'] = () => {
    this.app.history.unpause()
    // this.app.persist()
    this.tool.transition('idle')
  }

  onKeyDown: TLEvents<S>['keyboard'] = (info, e) => {
    switch (e.key) {
      case 'Alt': {
        this.startCloning()
        break
      }
      case 'Escape': {
        this.app.selectedShapes.forEach(shape => {
          shape.update({ point: this.initialPoints[shape.id] })
        })
        this.tool.transition('idle')
        break
      }
    }
  }

  onKeyUp: TLEvents<S>['keyboard'] = (info, e) => {
    switch (e.key) {
      case 'Alt': {
        if (!this.isCloning) throw Error('Expected to be cloning.')

        const { selectedShapesArray } = this.app
        // Remove the selected shapes (our clones)
        this.app.deleteShapes(selectedShapesArray)
        // Set the initial points to the original shape points
        this.initialPoints = this.initialShapePoints
        // Select the original shapes again
        this.app.setSelectedShapes(Object.keys(this.initialPoints))
        // Move the original shapes to the pointer
        this.moveSelectedShapesToPointer()
        this.isCloning = false
        break
      }
    }
  }
}
