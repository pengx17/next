import { Vec } from '@tldraw/vec'
import { TLApp, TLShape, TLToolState } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'
import type { TLEraseTool } from '../TLEraseTool'

export class PointingState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLEraseTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointing'

  onEnter = () => {
    const {
      userState: { currentPoint },
      shapesInViewport,
    } = this.app

    this.app.updateUserState({
      erasingShapeIds: shapesInViewport
        .filter(shape => shape.hitTestPoint(currentPoint))
        .map(shape => shape.id),
    })
  }

  onPointerMove: TLStateEvents<S, K>['onPointerDown'] = () => {
    const {
      userState: { currentPoint, originPoint },
    } = this.app
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('erasing')
      this.app.selectShapes([])
    }
  }

  onPointerUp: TLStateEvents<S, K>['onPointerUp'] = () => {
    const shapeIdsToDelete = [...this.app.userState.erasingShapeIds]
    this.app.updateUserState({ erasingShapeIds: [] })
    this.app.deleteShapes(shapeIdsToDelete.map(id => this.app.getShape(id)))
    this.tool.transition('idle')
  }
}
