import { Vec } from '@tldraw/vec'
import { TLApp, TLShape, TLSelectTool, TLToolState } from '~lib'
import type { TLEventMap, TLEvents, TLEventShapeInfo } from '~types'

export class PointingShapeState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointingShape'

  onEnter = (info: TLEventShapeInfo<S>) => {
    const {
      selectedIds,
      userState: { shiftKey },
    } = this.app
    if (shiftKey) {
      this.app.selectShapes([...Array.from(selectedIds.values()), info.shape.id])
    } else {
      this.app.selectShapes([info.shape])
    }
  }

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
    this.tool.transition('idle')
  }

  onPinchStart: TLEvents<S>['pinch'] = (info, event) => {
    this.tool.transition('pinching', { info, event })
  }
}
