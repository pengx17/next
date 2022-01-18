/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLEventMap } from '~types'
import type { TLShape } from './_shapes/TLShape'
import { TLState } from './_TLState'
import type { TLApp } from './_TLApp'
import type { TLTool } from './_TLTool'

export interface TLToolStateClass<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>,
  P extends TLTool<S, K, R> = TLTool<S, K, R>
> {
  new (tool: P, app: R): TLToolState<S, K, R, P>
  id: string
  defaultProps: S['model']
}

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
