import { Vec } from '@tldraw/vec'
import { TLDrawShape, TLToolState, TLShape, TLApp } from '~lib'
import type { TLStateEvents, TLEventMap } from '~types'
import { lerp, PointUtils, uniqueId } from '~utils'
import type { TLDrawTool } from '../TLDrawTool'

export class CreatingState<
  S extends TLShape,
  T extends S & TLDrawShape,
  K extends TLEventMap,
  R extends TLApp<S, K>,
  P extends TLDrawTool<T, S, K, R>
> extends TLToolState<S, K, R, P> {
  static id = 'creating'

  private shape = {} as T
  private points: number[][] = [[0, 0, 0.5]]

  // Add a new point and offset the shape, if necessary
  private addNextPoint(point: number[]) {
    const { shape } = this
    const offset = Vec.min(point, [0, 0])
    this.points.push(point)
    if (offset[0] < 0 || offset[1] < 0) {
      this.points = this.points.map(pt => Vec.sub(pt, offset).concat(pt[2]))
      shape.update({
        point: Vec.add(shape.model.point, offset),
        points: this.points,
      })
    } else {
      shape.update({
        points: this.points,
      })
    }
  }

  onEnter = () => {
    const { Shape, previousShape } = this.tool
    const {
      userState: { shiftKey, originPoint },
    } = this.app
    this.app.pause()
    if (shiftKey && previousShape) {
      // Continue the previous shape. Create points between the shape's
      // last point and the new point, then add the new point to the shape
      // and offset the existing points, if necessary.
      this.shape = previousShape
      const { shape } = this
      const prevPoint = shape.model.points[shape.model.points.length - 1]
      const nextPoint = Vec.sub(originPoint, shape.model.point).concat(originPoint[2] ?? 0.5)
      this.points = [...shape.model.points, prevPoint, prevPoint]
      const len = Math.ceil(Vec.dist(prevPoint, originPoint) / 16)
      for (let i = 0, t = i / (len - 1); i < len; i++) {
        this.points.push(
          Vec.lrp(prevPoint, nextPoint, t).concat(lerp(prevPoint[2], nextPoint[2], t))
        )
      }
      this.addNextPoint(nextPoint)
    } else {
      // Create a new shape and add the first point.
      this.tool.previousShape = undefined
      this.points = [[0, 0, originPoint[2] ?? 0.5]]
      const id = uniqueId()
      this.shape = this.app
        .createShape<T>({
          id,
          type: Shape.type,
          point: originPoint.slice(0, 2),
          points: this.points,
          isComplete: false,
        })
        .getShape<T>(id)
    }
  }

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    const { shape } = this
    const {
      userState: { currentPoint, previousPoint },
    } = this.app
    if (Vec.isEqual(previousPoint, currentPoint)) return
    this.addNextPoint(Vec.sub(currentPoint, shape.model.point).concat(currentPoint[2]))
  }

  onPointerUp: TLStateEvents<S, K>['onPointerUp'] = () => {
    if (!this.shape) throw Error('Expected a creating shape.')
    this.app.resume()
    this.shape.update({
      isComplete: true,
      points: this.tool.simplify
        ? PointUtils.simplify2(this.points, this.tool.simplifyTolerance)
        : this.shape.model.points,
    })
    this.tool.previousShape = this.shape
    this.tool.transition('idle')
  }

  onWheel: TLStateEvents<S, K>['onWheel'] = (info, e) => {
    this.onPointerMove(info, e)
  }

  onKeyDown: TLStateEvents<S>['onKeyDown'] = (info, e) => {
    switch (e.key) {
      case 'Escape': {
        if (!this.shape) throw Error('Expected a creating shape.')
        this.app.deleteShapes([this.shape])
        this.tool.transition('idle')
        break
      }
    }
  }
}
