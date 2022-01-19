import { Vec } from '@tldraw/vec'
import type { TLBoxTool } from '../TLBoxTool'
import { TLShape, TLApp, TLToolState, TLBoxShape } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'

export class PointingState<
  S extends TLShape,
  T extends S & TLBoxShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLBoxTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointing'

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    const {
      userState: { currentPoint, originPoint },
    } = this.app
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('creating')
      this.app.setSelectedShapes(Array.from(this.app.shapes.values()))
    }
  }

  onPointerUp = () => {
    this.tool.transition('idle')
  }
}
