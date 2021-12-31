import { TLApp, TLBoxShape, TLShape, TLTool } from '~lib'
import { TLCursor, TLEventMap } from '~types'
import { IdleState, PointingState, CreatingState } from './states'

// shape tools need to have two generics: a union of all shapes in
// the app, and the particular shape that they'll be creating

export interface TLBoxShapeClass<T extends TLBoxShape> {
  new (props: Partial<T['props']>): T
  aspectRatio?: number
  id: string
}

export abstract class TLBoxTool<
  T extends TLBoxShape = TLBoxShape,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>
> extends TLTool<S, K, R> {
  static id = 'box'

  static states = [IdleState, PointingState, CreatingState]

  static initial = 'idle'

  cursor = TLCursor.Cross

  abstract Shape: TLBoxShapeClass<T>
}
