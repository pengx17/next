import { TLApp, TLSelectTool, TLShape, TLToolState } from '~lib'
import { TLEventInfo, TLEventMap, TLTargetType } from '~types'

export class EditingShapeState<
  S extends TLShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLSelectTool<S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'editingShape'

  editingShape = {} as S

  onEnter = (info: { type: TLTargetType.Shape; shape: S; order?: number }) => {
    this.editingShape = info.shape
    this.app.setEditingShape(info.shape)
  }

  onExit = () => {
    this.app.setEditingShape(undefined)
  }

  onPointerDown = (info: TLEventInfo<S>) => {
    switch (info.type) {
      case TLTargetType.Shape: {
        if (info.shape === this.editingShape) return
        this.tool.transition('idle', info)
        break
      }
      case TLTargetType.Selection: {
        break
      }
      case TLTargetType.Handle: {
        break
      }
      case TLTargetType.Canvas: {
        if (!info.order) {
          this.tool.transition('idle', info)
        }
        break
      }
    }
  }
}
