import type { TLTextTool } from '../TLTextTool'
import { TLShape, TLApp, TLToolState, TLTextShape } from '~lib'
import Vec from '@tldraw/vec'
import { TLCursor, TLEventMap, TLTargetType } from '~types'
import type { TLBounds } from '@tldraw/intersect'
import { uniqueId } from '~utils'
import { transaction } from 'mobx'

export class CreatingState<
  S extends TLShape,
  T extends S & TLTextShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLTextTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'creating'

  cursor = TLCursor.Cross
  creatingShape?: T
  aspectRatio?: number
  initialBounds = {} as TLBounds

  onEnter = () => {
    const {
      userState: { originPoint },
    } = this.app
    const { Shape } = this.tool
    const id = uniqueId()
    const shape = this.app
      .createShape<T>({
        id,
        type: Shape.type,
        point: [...originPoint],
        text: '',
        size: [16, 32],
        isSizeLocked: true,
      })
      .getShape<T>(id)
    this.creatingShape = shape
    transaction(() => {
      const { bounds } = shape
      shape.update({ point: Vec.sub(originPoint, [bounds.width / 2, bounds.height / 2]) })
      this.app.transition('select')
      this.app.selectShapes([shape])
      this.app.currentState.transition('editingShape', {
        type: TLTargetType.Shape,
        shape: this.creatingShape,
        order: 0,
      })
    })
  }
}
