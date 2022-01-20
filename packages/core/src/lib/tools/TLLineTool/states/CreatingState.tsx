import type { TLLineTool } from '../TLLineTool'
import { TLShape, TLApp, TLToolState, TLLineShape } from '~lib'
import type { TLEventMap, TLStateEvents } from '~types'
import Vec from '@tldraw/vec'
import { uniqueId } from '~utils'
import { toJS } from 'mobx'

export class CreatingState<
  S extends TLShape,
  T extends S & TLLineShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLLineTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'creating'

  creatingShape = {} as T
  initialShape = {} as T['model']

  onEnter = () => {
    const { Shape } = this.tool
    const id = uniqueId()
    const shape = this.app
      .createShape<T>({
        id,
        type: Shape.type,
        point: this.app.userState.originPoint,
        handles: [{ point: [0, 0] }, { point: [1, 1] }],
      })
      .getShape<T>(id)
    this.initialShape = toJS(shape.model)
    this.creatingShape = shape
    this.app.selectShapes([shape])
  }

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    const {
      userState: { shiftKey, previousPoint, originPoint, currentPoint },
    } = this.app
    if (Vec.isEqual(previousPoint, currentPoint)) return
    const delta = Vec.sub(currentPoint, originPoint)
    if (shiftKey) {
      if (Math.abs(delta[0]) < Math.abs(delta[1])) {
        delta[0] = 0
      } else {
        delta[1] = 0
      }
    }
    const { initialShape } = this
    this.creatingShape.onHandleChange(initialShape, { index: 1, delta })
  }

  onPointerUp: TLStateEvents<S, K>['onPointerUp'] = () => {
    this.tool.transition('idle')
    if (this.creatingShape) {
      this.app.selectShapes([this.creatingShape])
    }
    if (!this.app.userState.isToolLocked) {
      this.app.transition('select')
    }
  }

  onWheel: TLStateEvents<S, K>['onWheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onKeyDown: TLStateEvents<S>['onKeyDown'] = (info, e) => {
    switch (e.key) {
      case 'Escape': {
        this.app.deleteShapes([this.creatingShape])
        this.tool.transition('idle')
        break
      }
    }
  }
}
