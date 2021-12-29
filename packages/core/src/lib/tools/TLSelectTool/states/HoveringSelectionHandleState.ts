/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CURSORS } from '~constants'
import { TLApp, TLSelectTool, TLShape, TLToolState } from '~lib'
import {
  TLEvents,
  TLSelectionHandle,
  TLEventMap,
  TLTargetType,
  TLEventSelectionInfo,
  TLRotateCorner,
} from '~types'

export class HoveringSelectionHandleState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'hoveringSelectionHandle'

  handle?: TLSelectionHandle

  onEnter = (info: TLEventSelectionInfo) => {
    this.app.cursors.setCursor(CURSORS[info.handle], this.app.selectionBounds!.rotation ?? 0)
    this.handle = info.handle
  }

  onExit = () => {
    this.app.cursors.reset()
  }

  onPinchStart: TLEvents<S>['pinch'] = (info, event) => {
    this.tool.transition('pinching', { info, event })
  }

  onPointerDown: TLEvents<S>['pointer'] = info => {
    const {
      inputs: { ctrlKey },
    } = this.app

    // Holding ctrlKey should ignore shapes
    if (ctrlKey) {
      this.tool.transition('pointingCanvas')
      return
    }

    switch (info.type) {
      case TLTargetType.Selection: {
        switch (info.handle) {
          case 'center': {
            break
          }
          case 'background': {
            break
          }
          case TLRotateCorner.TopLeft:
          case TLRotateCorner.TopRight:
          case TLRotateCorner.BottomRight:
          case TLRotateCorner.BottomLeft: {
            this.tool.transition('pointingRotateHandle', info)
            break
          }
          default: {
            this.tool.transition('pointingResizeHandle', info)
          }
        }
        break
      }
    }
  }

  onPointerLeave: TLEvents<S>['pointer'] = () => {
    this.tool.transition('idle')
  }

  onDoubleClick: TLEvents<S>['pointer'] = info => {
    if (info.order) return

    if (this.app.selectedShapesArray.length !== 1) return
    const selectedShape = this.app.selectedShapesArray[0]
    if (!selectedShape.isEditable) return

    switch (info.type) {
      case TLTargetType.Shape: {
        this.tool.transition('editingShape', info)
        break
      }
      case TLTargetType.Selection: {
        if (this.app.selectedShapesArray.length === 1) {
          this.tool.transition('editingShape', {
            type: TLTargetType.Shape,
            target: selectedShape,
          })
        }
        break
      }
    }
  }
}
