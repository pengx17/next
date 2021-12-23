/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  intersectLineSegmentBounds,
  intersectLineSegmentPolyline,
  intersectPolygonBounds,
  TLBounds,
} from '@tldraw/intersect'
import Vec from '@tldraw/vec'
import { action, computed, makeObservable, observable, toJS } from 'mobx'
import type {
  Merge,
  TLHandle,
  TLHandleChangeInfo,
  TLResizeInfo,
  TLShapeModel,
  TLShapeProps,
} from '~types'
import { BoundsUtils, PointUtils } from '~utils'

export interface TLShapeConstructor<S extends TLShape> {
  new (props: Partial<any> & TLShapeProps): S
  id: string
}

export abstract class TLShape<P = unknown> {
  constructor(props: Partial<P> & TLShapeProps) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { id: type, defaultProps } = this.constructor
    this.type = type
    this.id = props.id
    this.props = { ...defaultProps, ...props, type }
    makeObservable(this)
  }

  static id: string

  static defaultProps = {}

  readonly id: string
  readonly type: string
  readonly stayMounted: boolean = false
  readonly showCloneHandles: boolean = false
  readonly hideResizeHandles: boolean = false
  readonly hideRotateHandle: boolean = false
  readonly hideContextBar: boolean = false
  readonly hideSelectionDetail: boolean = false
  readonly hideSelection: boolean = false
  readonly isEditable: boolean = false
  readonly isStateful: boolean = false
  readonly aspectRatio?: number

  @observable props: TLShapeModel<P>

  @computed get parentId() {
    return this.props.parentId
  }

  validateProps = (props: Partial<TLShapeModel<any>>): Partial<TLShapeModel<any>> => {
    return props
  }

  @computed get serialized() {
    return toJS(this.props)
  }

  @action update = (props: Partial<TLShapeModel<any>>): this => {
    Object.assign(this.props, this.validateProps(props))
    return this
  }

  abstract getBounds: () => TLBounds

  @computed get bounds() {
    return this.getBounds()
  }

  getCenter = () => {
    return BoundsUtils.getBoundsCenter(this.bounds)
  }

  @computed get center(): number[] {
    return this.getCenter()
  }

  getRotatedBounds = () => {
    const { bounds } = this
    const { rotation } = this.props
    if (!rotation) return bounds
    return BoundsUtils.getBoundsFromPoints(BoundsUtils.getRotatedCorners(bounds, rotation))
  }

  @computed get rotatedBounds(): TLBounds {
    return this.getRotatedBounds()
  }

  hitTestPoint = (point: number[]): boolean => {
    const ownBounds = this.rotatedBounds
    const { rotation } = this.props
    if (!rotation) {
      return PointUtils.pointInBounds(point, ownBounds)
    }
    const corners = BoundsUtils.getRotatedCorners(ownBounds, rotation)
    return PointUtils.pointInPolygon(point, corners)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const box = BoundsUtils.getBoundsFromPoints([A, B])
    const { rotation = 0 } = this.props
    const { rotatedBounds } = this
    return BoundsUtils.boundsContain(rotatedBounds, box) || rotation
      ? intersectLineSegmentPolyline(A, B, BoundsUtils.getRotatedCorners(this.bounds)).didIntersect
      : intersectLineSegmentBounds(A, B, rotatedBounds).length > 0
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const { rotation = 0 } = this.props
    const { rotatedBounds } = this
    const corners = BoundsUtils.getRotatedCorners(this.bounds, rotation)
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      intersectPolygonBounds(corners, bounds).length > 0
    )
  }

  onResizeStart?: () => void

  onResize = (bounds: TLBounds, info: TLResizeInfo<typeof this.props>) => {
    this.update({ point: [bounds.minX, bounds.minY] })
    return this
  }

  clone = (id = this.props.id) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this.constructor({ ...this.props, id })
  }
}

export abstract class TLShapeWithChildren<
  P extends { children: string[] } = { children: string[] }
> extends TLShape<P> {}

export abstract class TLShapeWithHandles<
  H extends TLHandle = TLHandle,
  P extends { handles: H[] } = { handles: H[] }
> extends TLShape<P> {
  onHandleChange = ({ initialShape, delta, index }: TLHandleChangeInfo<H, P>) => {
    const nextHandles = [...initialShape.props.handles]
    nextHandles[index] = {
      ...nextHandles[index],
      point: Vec.add(delta, initialShape.props.handles[index].point),
    }
    const topLeft = BoundsUtils.getCommonTopLeft(nextHandles.map(h => h.point))
    this.update({
      point: Vec.add(initialShape.props.point, topLeft),
      handles: nextHandles.map(h => ({ ...h, point: Vec.sub(h.point, topLeft) })),
    })
  }
}
