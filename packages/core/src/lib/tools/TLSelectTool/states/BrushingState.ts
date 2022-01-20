import { TLApp, TLBush, TLSelectTool, TLShape, TLToolState } from '~lib'
import type { TLEvents, TLEventMap } from '~types'
import { BoundsUtils } from '~utils'

export class BrushingState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'brushing'

  private initialSelectedShapes: S[] = []

  private tree: TLBush<S> = new TLBush()

  onEnter = () => {
    const { selectedShapes, document } = this.app
    this.initialSelectedShapes = Array.from(selectedShapes.values())
    this.tree.load(document.shapes.map(s => this.app.getShape(s.id)))
    this.updateBrushSelection()
  }

  onExit = () => {
    this.initialSelectedShapes = []
    this.tree.clear()
  }

  onWheel: TLEvents<S>['wheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onPointerMove: TLEvents<S>['pointer'] = () => {
    this.updateBrushSelection()
  }

  onPointerUp: TLEvents<S>['pointer'] = () => {
    this.app.updateUserState({ brush: undefined })
    this.tool.transition('idle')
  }

  onKeyDown: TLEvents<S>['keyboard'] = (info, e) => {
    switch (e.key) {
      case 'Shift': {
        this.updateBrushSelection()
        break
      }
      case 'Ctrl': {
        this.updateBrushSelection()
        break
      }
      case 'Escape': {
        this.app.updateUserState({ brush: undefined })
        this.app.selectShapes(this.initialSelectedShapes)
        this.tool.transition('idle')
        break
      }
    }
  }

  private updateBrushSelection() {
    const {
      userState: { shiftKey, ctrlKey, originPoint, currentPoint },
    } = this.app

    const brushBounds = BoundsUtils.getBoundsFromPoints([currentPoint, originPoint], 0)

    this.app.updateUserState({ brush: brushBounds })

    const hits = this.tree
      .search(brushBounds)
      .filter(shape =>
        ctrlKey
          ? BoundsUtils.boundsContain(brushBounds, shape.rotatedBounds)
          : shape.hitTestBounds(brushBounds)
      )

    if (shiftKey) {
      if (hits.every(hit => this.initialSelectedShapes.includes(hit))) {
        // Deselect hit shapes
        this.app.selectShapes(this.initialSelectedShapes.filter(hit => !hits.includes(hit)))
      } else {
        // Select hit shapes + initial selected shapes
        this.app.selectShapes(
          Array.from(new Set([...this.initialSelectedShapes, ...hits]).values())
        )
      }
    } else {
      // Select hit shapes
      this.app.selectShapes(hits)
    }
  }
}
