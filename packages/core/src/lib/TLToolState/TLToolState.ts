/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLEventMap } from '~types'
import type { TLShape, TLApp, TLTool } from '~lib'
import { TLState } from '../TLState'

export abstract class TLToolState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLTool<S, K, R>
> extends TLState<S, K, R, P> {
  get app() {
    return this.root
  }

  get tool() {
    return this.parent
  }
}
