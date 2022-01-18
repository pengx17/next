/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

/* -------------------------------------------------- */
/*                        Shape                       */
/* -------------------------------------------------- */

import {
  intersectLineSegmentBounds,
  intersectLineSegmentPolyline,
  intersectPolygonBounds,
  TLBounds,
} from '@tldraw/intersect'
import { action, computed, makeObservable, toJS } from 'mobx'
import { BoundsUtils, PointUtils, uniqueId } from '~utils'
import type { TLApp } from '../../'
import type { TLResizeEdge, TLResizeCorner, TLAsset } from '../../_types'

export interface TLHandle {
  id?: string
  point: number[]
}

export type TLFlag = boolean | (() => boolean)

export interface TLShapeModel {
  id: string
  type: any
  point: number[]
  name?: string
  parentId?: string
  scale?: number[]
  rotation?: number
  handles?: TLHandle[]
  label?: string
  labelPosition?: number[]
  clipping?: number | number[]
  assetId?: string
  children?: string[]
  isGhost?: boolean
  isHidden?: boolean
  isLocked?: boolean
  isGenerated?: boolean
  isSizeLocked?: boolean
  isAspectRatioLocked?: boolean
}

export interface TLResizeInfo {
  bounds: TLBounds
  center: number[]
  rotation: number
  type: TLResizeEdge | TLResizeCorner
  clip: boolean
  scale: number[]
  transformOrigin: number[]
}

export interface TLResetBoundsInfo<T extends TLAsset> {
  asset?: T
}

export interface TLShapeConstructor<S extends TLShape> {
  new (app: TLApp<S & any, any>, id: string): S
  type: string
  defaultModel: S['model']
}

export class TLShape<S extends TLShapeModel = TLShapeModel> {
  constructor(public app: TLApp, public id: string) {
    makeObservable(this)
  }

  static type = 'shape'

  static defaultModel: TLShapeModel = {
    id: 'shape',
    type: 'shape',
    point: [0, 0],
  }

  // Options / Flags

  aspectRatio?: number
  // Display Flags
  hideCloneHandles = false
  hideResizeHandles = false
  hideRotateHandle = false
  hideContextBar = false
  hideSelectionDetail = false
  hideSelection = false
  // Behavior Flags
  canChangeAspectRatio: TLFlag = true
  canUnmount: TLFlag = true
  canResize: TLFlag = true
  canScale: TLFlag = true
  canFlip: TLFlag = true
  canEdit: TLFlag = false

  // Internal mutables
  protected scale: number[] = [1, 1]

  @computed get model(): S {
    const { id, app } = this
    return app.document.shapes.find(shapeModel => shapeModel.id === id)! as S
  }

  @computed get zIndex(): number {
    const { id, app } = this
    return app.document.shapes.findIndex(shapeModel => shapeModel.id === id)
  }

  /** Update the shape's props. */
  @action update(change: Partial<TLShapeModel> & { [key: string]: any }) {
    Object.assign(this.model, change)
    return this
  }

  /** Delete this shape. */
  delete = () => {
    this.app.deleteShapes([this.model])
    return this
  }

  /** Create a new shape from this shape's props. Returns the new shape. */
  clone = (id = uniqueId()) => {
    const { app, model } = this
    app.addShapes([{ ...toJS(model), id }], this.zIndex + 1)
    return app.shapes.get(id)
  }

  getBounds = () => {
    const {
      point: [x, y],
    } = this.model
    return {
      minX: x,
      minY: y,
      maxX: x + 100,
      maxY: y + 100,
      width: 100,
      height: 100,
    }
  }

  getCenter = () => {
    return BoundsUtils.getBoundsCenter(this.bounds)
  }

  getRotatedBounds = () => {
    const {
      bounds,
      model: { rotation },
    } = this
    if (!rotation) return bounds
    return BoundsUtils.getBoundsFromPoints(BoundsUtils.getRotatedCorners(bounds, rotation))
  }

  hitTestPoint = (point: number[]): boolean => {
    const ownBounds = this.rotatedBounds
    if (!this.model.rotation) {
      return PointUtils.pointInBounds(point, ownBounds)
    }
    const corners = BoundsUtils.getRotatedCorners(ownBounds, this.model.rotation)
    return PointUtils.pointInPolygon(point, corners)
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    const box = BoundsUtils.getBoundsFromPoints([A, B])
    const {
      rotatedBounds,
      model: { rotation = 0 },
    } = this
    return BoundsUtils.boundsContain(rotatedBounds, box) || rotation
      ? intersectLineSegmentPolyline(A, B, BoundsUtils.getRotatedCorners(this.bounds)).didIntersect
      : intersectLineSegmentBounds(A, B, rotatedBounds).length > 0
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const {
      rotatedBounds,
      model: { rotation = 0 },
    } = this
    const corners = BoundsUtils.getRotatedCorners(this.bounds, rotation)
    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      intersectPolygonBounds(corners, bounds).length > 0
    )
  }

  @computed get center(): number[] {
    return this.getCenter()
  }

  @computed get bounds(): TLBounds {
    return this.getBounds()
  }

  @computed get rotatedBounds(): TLBounds {
    return this.getRotatedBounds()
  }
}
