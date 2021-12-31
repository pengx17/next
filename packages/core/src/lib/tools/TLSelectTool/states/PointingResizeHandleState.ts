/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Vec } from '@tldraw/vec'
import { TLApp, TLSelectTool, TLShape, TLToolState } from '~lib'
import {
  TLEvents,
  TLSelectionHandle,
  TLEventMap,
  TLResizeCorner,
  TLEventSelectionInfo,
} from '~types'
import { CURSORS } from '~constants'

export class PointingResizeHandleState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointingResizeHandle'

  handle: TLSelectionHandle = TLResizeCorner.BottomLeft

  onEnter = (info: TLEventSelectionInfo) => {
    this.handle = info.handle
    this.updateCursor()
  }

  onExit = () => {
    this.app.cursors.reset()
  }

  onWheel: TLEvents<S>['wheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onPointerMove: TLEvents<S>['pointer'] = () => {
    const { currentPoint, originPoint } = this.app.inputs
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('resizing', { handle: this.handle })
    }
  }

  onPointerUp: TLEvents<S>['pointer'] = () => {
    this.tool.transition('idle')
  }

  onPinchStart: TLEvents<S>['pinch'] = (info, event) => {
    this.tool.transition('pinching', { info, event })
  }

  private updateCursor() {
    const rotation = this.app.selectionBounds!.rotation
    const cursor = CURSORS[this.handle]
    this.app.cursors.setCursor(cursor, rotation)
  }
}
