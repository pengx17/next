/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  intersectLineSegmentBounds,
  intersectLineSegmentPolyline,
  intersectPolygonBounds,
} from '@tldraw/intersect'
import Vec from '@tldraw/vec'
import { action, computed, makeObservable, observable, toJS } from 'mobx'
import type {
  TLBounds,
  AnyObject,
  TLResizeEdge,
  TLResizeCorner,
  TLShapeModel,
  TLShapeProps,
} from '~types'
import type { TLHandle } from '~types/TLHandle'
import { BoundsUtils, PointUtils } from '~utils'
import type { TLApp } from './TLApp'
import type { TLPage } from './TLPage'

export interface TLShapeConstructor<
  S extends TLShape = TLShape,
  R extends TLApp<S, any> = TLApp<S, any>
> {
  new (app: R, pageId: string, id: string): S
  id: string
}

export interface TLResizeInfo<P = any> {
  type: TLResizeEdge | TLResizeCorner
  scale: number[]
  transformOrigin: number[]
  initialShape: TLShapeModel<P>
}

export interface TLHandleChangeInfo<P = any> {
  index: number
  delta: number[]
  initialShape: TLShapeModel<P>
}

export type TLCustomProps<P extends AnyObject = AnyObject> = TLShapeProps & Partial<P>

export const defaultPropKeys = [
  'type',
  'nonce',
  'parentId',
  'point',
  'name',
  'rotation',
  'isGhost',
  'isHidden',
  'isLocked',
  'isGenerated',
  'isAspectRatioLocked',
]

export abstract class TLShape<
  P extends AnyObject = AnyObject,
  A extends TLApp<any, any> = TLApp<any, any>
> {
  constructor(app: A, pageId: string, id: string) {
    this.app = app
    this.pageId = pageId
    this.id = id
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const type = this.constructor['id']
    this.type = type
    makeObservable(this)
  }

  static id: string

  abstract defaultProps: P

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

  private app: TLApp

  @observable pageId: string

  @computed get page(): TLPage {
    return this.app.getPageById(this.pageId)
  }

  @computed get props(): TLShapeModel<P> {
    const shape = this.page.props.shapes.find(shape => shape.id === this.id) as TLShapeModel<P>
    if (!shape) throw Error(`Could not find shape with id ${this.id}`)
    return shape
  }

  @computed get parentId() {
    return this.props.parentId
  }

  abstract getBounds: () => TLBounds

  // protected init = (props: TLShapeProps & Partial<P>, propKeys: string[] = []) => {
  //   assignOwnProps(this, props)
  //   const keys = [...propKeys, ...Object.keys(props)]
  //   keys.forEach(key => this.propsKeys.add(key))
  //   this.lastSerialized = this.getSerialized()
  //   makeObservable(this)
  // }

  getCenter = () => {
    return BoundsUtils.getBoundsCenter(this.bounds)
  }

  getRotatedBounds = () => {
    const { bounds } = this
    const { rotation } = this.props
    if (!rotation) return bounds
    return BoundsUtils.getBoundsFromPoints(BoundsUtils.getRotatedCorners(bounds, rotation))
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

  onResize = (bounds: TLBounds, info: TLResizeInfo<P>) => {
    this.update({ point: [bounds.minX, bounds.minY] })
    return this
  }

  onResizeStart?: () => void

  @computed get center(): number[] {
    return this.getCenter()
  }

  @computed get bounds(): TLBounds {
    return this.getBounds()
  }

  @computed get rotatedBounds(): TLBounds {
    return this.getRotatedBounds()
  }

  getSerialized = (): TLShapeModel<P> => {
    return toJS(this.props)
    // const propKeys = Array.from(this.propsKeys.values()) as (keyof TLShapeProps & P)[]
    // return deepCopy(Object.fromEntries(propKeys.map(key => [key, this[key]]))) as TLShapeModel<P>
  }

  protected getCachedSerialized = (): TLShapeModel<P> => {
    // if (this.isDirty) {
    //   this.nonce++
    //   this.isDirty = false
    //   this.lastSerialized = this.getSerialized()
    // }
    // return this.lastSerialized
    return this.getSerialized()
  }

  get serialized(): TLShapeModel<P> {
    return this.getCachedSerialized()
  }

  validateProps = (
    props: Partial<TLShapeProps> & Partial<P>
  ): Partial<TLShapeProps> & Partial<P> => {
    return props
  }

  @action update = (props: Partial<TLShapeProps & P & any>, isDeserializing = false) => {
    // if (!(isDeserializing || this.isDirty)) this.isDirty = true
    // this.page.shapes[this.pageId].shapes
    Object.assign(this.props, this.validateProps(props as Partial<TLShapeProps> & Partial<P>))
    return this
  }

  clone = (id = this.id) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this.constructor(this.app, this.pageId, id)
  }
}

export abstract class TLShapeWithHandles<
  H extends TLHandle = TLHandle,
  P extends { handles: H[] } = any,
  A extends TLApp<any, any> = TLApp<any, any>
> extends TLShape<P, A> {
  protected propsKeys = new Set<string>(defaultPropKeys)

  @observable handles: H[] = []

  onHandleChange = ({ initialShape, delta, index }: TLHandleChangeInfo<P>) => {
    const nextHandles = [...initialShape.handles]
    nextHandles[index] = {
      ...nextHandles[index],
      point: Vec.add(delta, initialShape.handles[index].point),
    }
    const topLeft = BoundsUtils.getCommonTopLeft(nextHandles.map(h => h.point))
    this.update({
      point: Vec.add(initialShape.point, topLeft),
      handles: nextHandles.map(h => ({ ...h, point: Vec.sub(h.point, topLeft) })),
    })

    // const { shape, initialShape, handles } = this
    // handles[index].point = Vec.add(delta, initialHandles[index].point)
    // const topLeft = BoundsUtils.getCommonTopLeft(handles.map((h) => h.point))
    // shape.update({
    //   point: Vec.add(initialTopLeft, topLeft),
    //   handles: handles.map((h) => ({ ...h, point: Vec.sub(h.point, topLeft) })),
    // })
  }
}

export abstract class TLShapeWithChildren<
  P extends { children: TLShape[] } = any,
  A extends TLApp<any, any> = TLApp<any, any>
> extends TLShape<P, A> {
  protected propsKeys = new Set<string>([
    'type',
    'nonce',
    'parentId',
    'point',
    'name',
    'rotation',
    'children',
    'isGhost',
    'isHidden',
    'isLocked',
    'isGenerated',
    'isAspectRatioLocked',
  ])

  @observable children: TLShape[] = []
}
