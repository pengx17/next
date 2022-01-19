import { Vec } from '@tldraw/vec'
import type { TLLineTool } from '../TLLineTool'
import { TLShape, TLApp, TLToolState, TLLineShape } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'

export class PointingState<
  S extends TLShape,
  T extends S & TLLineShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLLineTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointing'

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    const {
      userState: { currentPoint, originPoint },
    } = this.app
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('creating')
    }
  }
}
