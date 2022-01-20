import Vec from '@tldraw/vec'
import { TLApp, TLShape, TLToolState, TLDotShape } from '~lib'
import { uniqueId } from '~utils'
import type { TLEventMap, TLStateEvents } from '~types'
import type { TLDotTool } from '../TLDotTool'

export class CreatingState<
  S extends TLShape,
  T extends S & TLDotShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLDotTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'creating'

  creatingShape?: T

  offset: number[] = [0, 0]

  onEnter = () => {
    const { Shape } = this.tool
    this.offset = [Shape.defaultModel.radius, Shape.defaultModel.radius]
    const id = uniqueId()
    this.tool.app.createShape<S>({
      id,
      type: Shape.type,
      point: Vec.sub(this.app.userState.originPoint, this.offset),
    })
    const shape = this.tool.app.getShape<T>(id)
    this.creatingShape = shape
    this.app.selectShapes([shape])
  }

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    if (!this.creatingShape) throw Error('Expected a creating shape.')
    const {
      userState: { currentPoint },
    } = this.app
    this.creatingShape.update({
      point: Vec.sub(currentPoint, this.offset),
    })
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
        if (!this.creatingShape) throw Error('Expected a creating shape.')
        this.app.deleteShapes([this.creatingShape])
        this.tool.transition('idle')
        break
      }
    }
  }
}
