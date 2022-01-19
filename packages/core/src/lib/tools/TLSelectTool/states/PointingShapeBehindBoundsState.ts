import { Vec } from '@tldraw/vec'
import { TLApp, TLShape, TLSelectTool, TLToolState } from '~lib'
import type { TLEventMap, TLEvents, TLEventShapeInfo } from '~types'

export class PointingShapeBehindBoundsState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointingShapeBehindBounds'

  private info = {} as TLEventShapeInfo<S>

  onEnter = (info: TLEventShapeInfo<S>) => {
    this.info = info
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
    const {
      selectedIds,
      userState: { shiftKey },
    } = this.app
    if (shiftKey) {
      this.app.setSelectedShapes([...Array.from(selectedIds.values()), this.info.shape.id])
    } else {
      this.app.setSelectedShapes([this.info.shape.id])
    }
    this.tool.transition('idle')
  }

  onPinchStart: TLEvents<S>['pinch'] = (info, event) => {
    this.tool.transition('pinching', { info, event })
  }
}
