import { Vec } from '@tldraw/vec'
import { TLToolState, TLShape, TLApp } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'
import type { TLEraseTool } from '../TLEraseTool'

export class ErasingState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLEraseTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'erasing'

  private points: number[][] = [[0, 0, 0.5]]
  private hitShapes: Set<S> = new Set()

  onEnter: TLStateEvents<S, K>['onEnter'] = () => {
    const {
      userState: { originPoint },
    } = this.app
    this.points = [originPoint]
    this.hitShapes.clear()
  }

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    const {
      shapesInViewport,
      userState: { currentPoint, previousPoint },
    } = this.app
    if (Vec.isEqual(previousPoint, currentPoint)) return
    this.points.push(currentPoint)
    shapesInViewport
      .filter(shape => shape.hitTestLineSegment(previousPoint, currentPoint))
      .forEach(shape => this.hitShapes.add(shape))
    this.app.updateUserState({
      erasingIds: Array.from(this.hitShapes.values()).map(shape => shape.id),
    })
  }

  onPointerUp: TLStateEvents<S, K>['onPointerUp'] = () => {
    this.app.deleteShapes(Array.from(this.hitShapes.values()))
    this.tool.transition('idle')
  }

  onWheel: TLStateEvents<S, K>['onWheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onKeyDown: TLStateEvents<S>['onKeyDown'] = (info, e) => {
    switch (e.key) {
      case 'Escape': {
        this.app.updateUserState({ erasingIds: [] })
        this.tool.transition('idle')
        break
      }
    }
  }
}
