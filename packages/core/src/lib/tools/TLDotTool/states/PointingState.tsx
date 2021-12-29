import Vec from '@tldraw/vec'
import { TLDotShape, TLApp, TLShape, TLToolState } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'
import type { TLDotTool } from '../TLDotTool'

export class PointingState<
  S extends TLShape,
  T extends S & TLDotShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLDotTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'pointing'

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    const { currentPoint, originPoint } = this.app.inputs
    if (Vec.dist(currentPoint, originPoint) > 5) {
      this.tool.transition('creating')
      this.app.setSelectedShapes([])
    }
  }
}
