import type { TLTextTool } from '../TLTextTool'
import { TLShape, TLApp, TLToolState, TLTextShape } from '~lib'
import Vec from '@tldraw/vec'
import { TLCursor, TLEventMap, TLResizeCorner, TLStateEvents, TLTargetType } from '~types'
import type { TLBounds } from '@tldraw/intersect'
import { BoundsUtils, uniqueId } from '~utils'
import { transaction } from 'mobx'

export class CreatingState<
  T extends TLTextShape,
  S extends TLShape,
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
      currentPage,
      inputs: { originPoint },
    } = this.app
    const { Shape } = this.tool
    const shape = new Shape({
      id: uniqueId(),
      type: Shape.id,
      parentId: currentPage.id,
      point: [...originPoint],
      text: '',
      size: [16, 32],
      isSizeLocked: true,
    })
    this.creatingShape = shape
    transaction(() => {
      this.app.currentPage.addShapes(shape as unknown as S)
      const { bounds } = shape
      shape.update({ point: Vec.sub(originPoint, [bounds.width / 2, bounds.height / 2]) })
      this.app.transition('select')
      this.app.setSelectedShapes([shape as unknown as S])
      this.app.currentState.transition('editingShape', {
        type: TLTargetType.Shape,
        shape: this.creatingShape,
        order: 0,
      })
    })
  }
}
