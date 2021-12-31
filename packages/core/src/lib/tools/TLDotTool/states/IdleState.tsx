import { TLDotShape, TLApp, TLShape, TLToolState } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'
import type { TLDotTool } from '../TLDotTool'

export class IdleState<
  S extends TLShape,
  T extends S & TLDotShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLDotTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'idle'

  onPointerDown: TLStateEvents<S, K>['onPointerDown'] = (info, e) => {
    if (info.order) return
    this.tool.transition('pointing')
  }

  onPinchStart: TLStateEvents<S, K>['onPinchStart'] = (...args) => {
    this.app.transition('select', { returnTo: 'box' })
    this.app.onPinchStart?.(...args)
  }
}
