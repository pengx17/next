import { TLApp, TLBoxShape, TLShape, TLTool } from '~lib'
import { TLCursor, TLEventMap } from '~types'
import { IdleState, PointingState, CreatingState } from './states'

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

  abstract Shape: {
    new (app: TLApp, id: string): T
    type: string
    aspectRatio?: number
    defaultModel: T['model']
  }
}
