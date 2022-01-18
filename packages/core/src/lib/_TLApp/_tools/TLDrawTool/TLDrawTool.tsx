import { IdleState, CreatingState } from './states'
import { TLTool, TLApp, TLShape, TLDrawShape, TLDrawShapeModel } from '~lib/_TLApp'
import { TLCursor, TLEventMap } from '~types'

export abstract class TLDrawTool<
  T extends TLDrawShape = TLDrawShape,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>
> extends TLTool<S, K, R> {
  static id = 'draw'

  static states = [IdleState, CreatingState]

  static initial = 'idle'

  cursor = TLCursor.Cross

  /** Whether to simplify the shape's points after creating. */
  simplify = true

  /** The minimum distance between points when simplifying a line. */
  simplifyTolerance = 1

  previousShape?: T

  abstract Shape: {
    new (app: TLApp, id: string): T
    type: string
    defaultModel: T['model']
  }
}
