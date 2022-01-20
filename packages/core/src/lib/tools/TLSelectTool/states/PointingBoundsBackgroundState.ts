import { Vec } from '@tldraw/vec'
import { TLApp, TLSelectTool, TLShape, TLToolState } from '~lib'
import { TLCursor, TLEventMap, TLEvents } from '~types'

export class PointingBoundsBackgroundState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointingBoundsBackground'

  cursor = TLCursor.Move

  onWheel: TLEvents<S>['wheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onPointerMove: TLEvents<S>['pointer'] = () => {
    const {
      userState: { currentPoint, originPoint },
    } = this.app
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('translating')
    }
  }

  onPointerUp: TLEvents<S>['pointer'] = () => {
    this.app.selectShapes([])
    this.tool.transition('idle')
  }

  onPinchStart: TLEvents<S>['pinch'] = (info, event) => {
    this.tool.transition('pinching', { info, event })
  }
}
