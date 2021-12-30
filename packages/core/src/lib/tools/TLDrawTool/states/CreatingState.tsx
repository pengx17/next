import { Vec } from '@tldraw/vec'
import { TLDrawShape, TLToolState, TLShape, TLApp } from '~lib'
import type { TLStateEvents, TLEventMap } from '~types'
import { PointUtils, uniqueId } from '~utils'
import type { TLDrawTool } from '../TLDrawTool'

export class CreatingState<
  S extends TLShape,
  T extends S & TLDrawShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLDrawTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'creating'

  private creatingShape?: T
  private rawPoints: number[][] = [[0, 0, 0.5]]
  private points: number[][] = [[0, 0, 0.5]]
  private offset: number[] = [0, 0, 0.5]

  onEnter = () => {
    const { Shape } = this.tool

    const { originPoint } = this.app.inputs

    this.app.history.pause()

    const shape = new Shape({
      id: uniqueId(),
      type: Shape.id,
      parentId: this.app.currentPage.id,
      point: originPoint,
      points: [[0, 0, originPoint[2]]],
      isComplete: false,
    })

    this.creatingShape = shape
    this.app.currentPage.addShapes(shape)
    this.points = [[0, 0, originPoint[2]]]
    this.rawPoints = [[0, 0, originPoint[2]]]
    this.offset = [0, 0, originPoint[2]]
  }

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    if (!this.creatingShape) throw Error('Expected a creating shape.')
    const { currentPoint, previousPoint, originPoint } = this.app.inputs
    if (Vec.isEqual(previousPoint, currentPoint)) return

    // The point relative to the initial point
    const point = Vec.sub(currentPoint, originPoint).concat(currentPoint[2])

    // The raw points array holds the relative points
    this.rawPoints.push(point)

    // If the new point is left or above the initial point,
    // update the top left, move the shape so that its page point
    // is at the top left, and move the points so that they appear
    // to stay in the same place.
    if (point[0] < this.offset[0] || point[1] < this.offset[1]) {
      this.offset = [Math.min(this.offset[0], point[0]), Math.min(this.offset[1], point[1])]
      this.points = this.rawPoints.map(point => Vec.sub(point, this.offset).concat(point[2]))
      this.creatingShape.update({
        point: Vec.add(originPoint, this.offset),
        points: this.points,
      })
    } else {
      this.points.push(Vec.toFixed(Vec.sub(point, this.offset).concat(currentPoint[2])))
      this.creatingShape.update({
        points: this.points,
      })
    }
  }

  onPointerUp: TLStateEvents<S, K>['onPointerUp'] = () => {
    if (!this.creatingShape) throw Error('Expected a creating shape.')

    this.app.history.resume()
    this.creatingShape.update({
      isComplete: true,
      points: this.tool.simplify
        ? PointUtils.simplify2(this.points, this.tool.simplifyTolerance)
        : this.creatingShape.props.points,
    })

    this.tool.transition('idle')
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
