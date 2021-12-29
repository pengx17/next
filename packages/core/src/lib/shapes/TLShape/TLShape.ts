import {
  intersectLineSegmentBounds,
  intersectLineSegmentPolyline,
  intersectPolygonBounds,
} from '@tldraw/intersect'
import { action, computed, makeObservable, observable, toJS } from 'mobx'
import type { TLBounds, TLHandle, TLResizeCorner, TLResizeEdge } from '~types'
import { BoundsUtils, PointUtils } from '~utils'

export interface TLShapeProps {
  id: string
  type: string
  parentId: string
  point: number[]
  rotation?: number
  name?: string
  handles?: TLHandle[]
  children?: string[]
  isGhost?: boolean
  isHidden?: boolean
  isLocked?: boolean
  isGenerated?: boolean
  isAspectRatioLocked?: boolean
}

export interface TLResizeInfo<P extends TLShapeProps = TLShapeProps> {
  type: TLResizeEdge | TLResizeCorner
  scale: number[]
  transformOrigin: number[]
  initialShape: P
}

export interface TLShapeFlags {
  stayMounted: boolean
  showCloneHandles: boolean
  hideResizeHandles: boolean
  hideRotateHandle: boolean
  hideContextBar: boolean
  hideSelectionDetail: boolean
  hideSelection: boolean
  isEditable: boolean
  aspectRatio: number
}

export interface TLShapeMethods<
  P extends TLShapeProps = TLShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> {
  validateProps?(this: TLShape<P, C>, props: Partial<P>): Partial<P>
  hitTestPoint?(this: TLShape<P, C>, point: number[]): boolean
  hitTestLineSegment?(this: TLShape<P, C>, A: number[], B: number[]): boolean
  hitTestBounds?(this: TLShape<P, C>, bounds: TLBounds): boolean
  onResizeStart?(this: TLShape<P, C>): this
  onResize?(this: TLShape<P, C>, bounds: TLBounds, info: TLResizeInfo<P>): this
}

export interface TLShapeOptions<
  P extends TLShapeProps = TLShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> extends Partial<TLShapeFlags>,
    TLShapeMethods<P, C> {
  type: string
  defaultProps: P
  context?: C
  bounds(this: TLShape<P, C>): TLBounds
  rotatedBounds(this: TLShape<P, C>): TLBounds
  center(this: TLShape<P, C>): number[]
}

export interface TLShape<
  P extends TLShapeProps = TLShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> extends Partial<TLShapeFlags>,
    Required<TLShapeMethods<P, C>> {
  readonly type: string
  readonly id: string
  props: P
  context: C
  parentId: string
  serialized: P
  bounds: TLBounds
  rotatedBounds: TLBounds
  center: number[]
  clone: (this: TLShape<P, C>) => TLShape<P, C>
  update: (this: TLShape<P, C>, props: Partial<P & any>) => TLShape<P, C>
}

export type TLShapeClass<
  P extends TLShapeProps = TLShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = {
  new (props: Partial<P>): TLShape<P, C>
  id: P['id']
}

export function createShapeClass<
  P extends TLShapeProps = TLShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
>(options = {} as TLShapeOptions<P, C>): TLShapeClass<P, C> {
  const { bounds, rotatedBounds, center, ...rest } = options
  class Shape implements TLShape<P, C> {
    constructor(props: Partial<P>) {
      this.props = { ...options.defaultProps, ...props } as P
      this.getBounds = bounds.bind(this)
      this.getRotatedBounds = rotatedBounds.bind(this)
      this.getCenter = center.bind(this)
      Object.assign(this, rest)
      makeObservable(this, {
        props: observable,
        parentId: computed,
        serialized: computed,
        update: action,
        bounds: computed,
        center: computed,
        rotatedBounds: computed,
      })
    }

    static defaultProps = options.defaultProps
    readonly type = options.type
    readonly id = options.type
    static id = options.type
    props: P
    context: C = options.context ?? ({} as C)
    getBounds: () => TLBounds
    getRotatedBounds: () => TLBounds
    getCenter: () => number[]
    get bounds(): TLBounds {
      return this.getBounds()
    }
    get rotatedBounds(): TLBounds {
      return this.getRotatedBounds()
    }
    get center(): number[] {
      return this.getCenter()
    }
    hitTestPoint(point: number[]): boolean {
      const ownBounds = this.rotatedBounds
      const { rotation } = this.props
      if (!rotation) return PointUtils.pointInBounds(point, ownBounds)
      const corners = BoundsUtils.getRotatedCorners(ownBounds, rotation)
      return PointUtils.pointInPolygon(point, corners)
    }
    hitTestLineSegment(A: number[], B: number[]): boolean {
      const box = BoundsUtils.getBoundsFromPoints([A, B])
      const { rotation = 0 } = this.props
      const { rotatedBounds } = this
      return BoundsUtils.boundsContain(rotatedBounds, box) || rotation
        ? intersectLineSegmentPolyline(A, B, BoundsUtils.getRotatedCorners(this.bounds))
            .didIntersect
        : intersectLineSegmentBounds(A, B, rotatedBounds).length > 0
    }
    hitTestBounds(bounds: TLBounds): boolean {
      const { rotation = 0 } = this.props
      const { rotatedBounds } = this
      const corners = BoundsUtils.getRotatedCorners(this.bounds, rotation)
      return (
        BoundsUtils.boundsContain(bounds, rotatedBounds) ||
        intersectPolygonBounds(corners, bounds).length > 0
      )
    }
    onResizeStart() {
      return this
    }
    onResize(bounds: TLBounds) {
      this.update({ point: [bounds.minX, bounds.minY] } as P)
      return this
    }
    validateProps(props: Partial<P & any>) {
      return props
    }
    update(props: Partial<P & any>) {
      Object.assign(this.props, this.validateProps(props))
      return this
    }
    clone(id = this.props.id ?? 'id') {
      return new Shape({ ...this.props, id })
    }
    get serialized() {
      return toJS(this.props)
    }
    get parentId() {
      return this.props.parentId
    }
  }

  // function factory(props: Partial<P>): TLShape<P, C> {
  //   const result: TLShape<P, C> = {
  //     props: { ...options.defaultProps, ...props },
  //     id: props.id ?? 'id',
  //     context: (options.context as C) ?? ({} as C),
  //     hitTestPoint(point: number[]): boolean {
  //       const ownBounds = this.rotatedBounds
  //       const { rotation } = this.props
  //       if (!rotation) return PointUtils.pointInBounds(point, ownBounds)
  //       const corners = BoundsUtils.getRotatedCorners(ownBounds, rotation)
  //       return PointUtils.pointInPolygon(point, corners)
  //     },
  //     hitTestLineSegment(A: number[], B: number[]): boolean {
  //       const box = BoundsUtils.getBoundsFromPoints([A, B])
  //       const { rotation = 0 } = this.props
  //       const { rotatedBounds } = this
  //       return BoundsUtils.boundsContain(rotatedBounds, box) || rotation
  //         ? intersectLineSegmentPolyline(A, B, BoundsUtils.getRotatedCorners(this.bounds))
  //             .didIntersect
  //         : intersectLineSegmentBounds(A, B, rotatedBounds).length > 0
  //     },
  //     hitTestBounds(bounds: TLBounds): boolean {
  //       const { rotation = 0 } = this.props
  //       const { rotatedBounds } = this
  //       const corners = BoundsUtils.getRotatedCorners(this.bounds, rotation)
  //       return (
  //         BoundsUtils.boundsContain(bounds, rotatedBounds) ||
  //         intersectPolygonBounds(corners, bounds).length > 0
  //       )
  //     },
  //     onResizeStart() {
  //       return this
  //     },
  //     onResize(bounds) {
  //       this.update({ point: [bounds.minX, bounds.minY] } as P)
  //       return this
  //     },
  //     validateProps(props) {
  //       return props
  //     },
  //     update(props) {
  //       Object.assign(this.props, this.validateProps(props))
  //       return this
  //     },
  //     clone(id = props.id ?? 'id') {
  //       return factory({ ...this.props, id })
  //     },
  //     get serialized() {
  //       return toJS(this.props)
  //     },
  //     get parentId() {
  //       return this.props.parentId
  //     },
  //     ...options,
  //   }

  //   return result
  // }

  return Shape
}

// factory.id = options.type

// return factory

// function factory(props: Partial<P>): TLShape<P, C> {
//   const result: TLShape<P, C> = {
//     props: { ...options.defaultProps, ...props },
//     id: props.id ?? 'id',
//     context: (options.context as C) ?? ({} as C),
//     hitTestPoint(point: number[]): boolean {
//       const ownBounds = this.rotatedBounds
//       const { rotation } = this.props
//       if (!rotation) return PointUtils.pointInBounds(point, ownBounds)
//       const corners = BoundsUtils.getRotatedCorners(ownBounds, rotation)
//       return PointUtils.pointInPolygon(point, corners)
//     },
//     hitTestLineSegment(A: number[], B: number[]): boolean {
//       const box = BoundsUtils.getBoundsFromPoints([A, B])
//       const { rotation = 0 } = this.props
//       const { rotatedBounds } = this
//       return BoundsUtils.boundsContain(rotatedBounds, box) || rotation
//         ? intersectLineSegmentPolyline(A, B, BoundsUtils.getRotatedCorners(this.bounds))
//             .didIntersect
//         : intersectLineSegmentBounds(A, B, rotatedBounds).length > 0
//     },
//     hitTestBounds(bounds: TLBounds): boolean {
//       const { rotation = 0 } = this.props
//       const { rotatedBounds } = this
//       const corners = BoundsUtils.getRotatedCorners(this.bounds, rotation)
//       return (
//         BoundsUtils.boundsContain(bounds, rotatedBounds) ||
//         intersectPolygonBounds(corners, bounds).length > 0
//       )
//     },
//     onResizeStart() {
//       return this
//     },
//     onResize(bounds) {
//       this.update({ point: [bounds.minX, bounds.minY] } as P)
//       return this
//     },
//     validateProps(props) {
//       return props
//     },
//     update(props) {
//       Object.assign(this.props, this.validateProps(props))
//       return this
//     },
//     clone(id = props.id ?? 'id') {
//       return factory({ ...this.props, id })
//     },
//     get serialized() {
//       return toJS(this.props)
//     },
//     get parentId() {
//       return this.props.parentId
//     },
//     ...options,
//   }

//   makeObservable(result, {
//     props: observable,
//     parentId: observable,
//     serialized: computed,
//     update: action,
//     bounds: observable,
//     center: computed,
//     rotatedBounds: observable,
//   })

//   return result
// }

// factory.id = options.type

// return factory
// }
