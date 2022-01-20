/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLBounds, TLEventInfo } from './types'
import type { TLEventMap } from './TLEventMap'
import type { TLShape } from '../lib/TLShape'

export interface TLEvents<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  E extends TLEventInfo<S> = TLEventInfo<S>
> {
  wheel: (info: E & { delta: number[]; point: number[] }, event: K['wheel']) => void
  pinch: (
    info: E & { delta: number[]; point: number[]; offset: number[] },
    event: K['wheel'] | K['pointer'] | K['touch'] | K['keyboard'] | K['gesture']
  ) => void
  pointer: (info: E, event: K['pointer'] | K['wheel']) => void
  keyboard: (info: E, event: K['keyboard']) => void
  resize: (bounds: TLBounds) => void
}
