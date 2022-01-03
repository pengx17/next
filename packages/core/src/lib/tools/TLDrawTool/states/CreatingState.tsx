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
  private initialPoint: number[] = [0, 0]
  private initialOffset: number[] = [0, 0]

  onEnter = () => {
    const { Shape, previousShape } = this.tool
    const { originPoint } = this.app.inputs
    this.app.history.pause()
    if (this.app.inputs.shiftKey && previousShape) {
      const shape = previousShape
      // (1)
      // Add the new points connecting the previous line to the new point.
      // The previous point is the last of the shape's current points
      const prevPoint = shape.props.points[shape.props.points.length - 1]
      // The new point relative to the shape's current point (ie in the same coordinate space as the shape's current points)
      const relativeNewPoint = Vec.sub(originPoint, shape.props.point).concat(originPoint[2] ?? 0.5)
      // Add the new points to the shape's current points, in the same coordinate space
      let newPoints = [...shape.props.points, prevPoint, prevPoint]
      const len = Math.ceil(Vec.dist(prevPoint, originPoint) / 16)
      for (let i = 0; i < len; i++) {
        const t = i / (len - 1)
        newPoints.push(
          Vec.lrp(prevPoint, relativeNewPoint, t).concat(
            ((prevPoint[2] + relativeNewPoint[2]) / 2) * t
          )
        )
      }
      // (2)
      // If the top left point has changed, then shift over the points
      if (relativeNewPoint[0] < 0 || relativeNewPoint[1] < 0) {
        const topLeft = [
          Math.min(shape.props.point[0], originPoint[0]),
          Math.min(shape.props.point[1], originPoint[1]),
        ]
        // How much will we need to shift the shape's point?
        const pointDelta = Vec.sub(originPoint, topLeft)
        // How much will we need to shift the others point?
        const oldPointsDelta = Vec.sub(shape.props.point, topLeft)
        // Shift over the shape's initial points by the inverse of the point delta
        newPoints = newPoints.map((pt: number[]) => Vec.add(pt, oldPointsDelta).concat(pt[2]))
        // Shift the raw points over by the point delta, so that we can adjust them correctly later
        this.rawPoints = newPoints.map(pt => Vec.add(pt, pointDelta).concat(pt[2]))
        this.initialPoint = topLeft
        this.points = newPoints
        this.offset = [0, 0]
        this.initialOffset = Vec.add(this.initialPoint, originPoint)
        shape.update({
          point: this.initialPoint,
          points: newPoints,
        })
      } else {
        // We don't need to move the shape's points or shift the points
        this.initialPoint = shape.props.point
        this.offset = [0, 0]
        this.points = newPoints
        this.rawPoints = newPoints.map(pt => Vec.sub(pt, this.offset).concat(pt[2]))
        this.initialOffset = [0, 0]
        shape.update({
          points: newPoints,
        })
      }
      this.creatingShape = previousShape
    } else {
      const startPoint = [0, 0, originPoint[2] ?? 0.5]
      this.initialPoint = originPoint.slice(0, 2)
      this.offset = [0, 0]
      this.initialOffset = [0, 0]
      this.points = [startPoint]
      this.rawPoints = [startPoint]
      this.creatingShape = new Shape({
        id: uniqueId(),
        type: Shape.id,
        parentId: this.app.currentPage.id,
        point: this.initialPoint,
        points: [startPoint],
        isComplete: false,
      })
      this.app.currentPage.addShapes(this.creatingShape)
    }
  }

  onPointerMove: TLStateEvents<S, K>['onPointerMove'] = () => {
    if (!this.creatingShape) throw Error('Expected a creating shape.')
    const { initialPoint, initialOffset } = this
    const { currentPoint, previousPoint, originPoint } = this.app.inputs
    if (Vec.isEqual(previousPoint, currentPoint)) return

    // The point relative to the initial point
    const delta = Vec.sub(currentPoint, originPoint)
    const point = Vec.add(delta, initialOffset).concat(currentPoint[2])

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
        point: Vec.add(initialPoint, this.offset),
        points: this.points,
      })
    } else {
      this.points.push(Vec.toFixed(Vec.sub(point, this.offset).concat(point[2])))
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

    this.tool.previousShape = this.creatingShape
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
