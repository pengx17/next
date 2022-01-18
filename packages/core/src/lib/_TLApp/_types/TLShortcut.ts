import type { TLShape } from '../_shapes/TLShape'
import type { TLRootState, TLState } from '../_TLState'
import type { TLEventMap } from './TLEventMap'

export type TLShortcut<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLRootState<S, K> = TLRootState<S, K>,
  T extends R | TLState<S, K, R, any> = any
> = {
  keys: string | string[]
  fn: (api: R, state: T, event: KeyboardEvent) => void
}
