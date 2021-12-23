/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLApp, TLShape } from '~lib'
import type { TLEventMap } from './TLEventMap'
import type { TLHandle } from './TLHandle'

export enum TLResizeEdge {
  Top = 'top_edge',
  Right = 'right_edge',
  Bottom = 'bottom_edge',
  Left = 'left_edge',
}

export enum TLResizeCorner {
  TopLeft = 'top_left_corner',
  TopRight = 'top_right_corner',
  BottomRight = 'bottom_right_corner',
  BottomLeft = 'bottom_left_corner',
}

export enum TLRotateCorner {
  TopLeft = 'top_left_resize_corner',
  TopRight = 'top_right_resize_corner',
  BottomRight = 'bottom_right_resize_corner',
  BottomLeft = 'bottom_left_resize_corner',
}

export enum TLMoveDirection {
  Forward = 'forward',
  Backward = 'backward',
  ToFront = 'to_front',
  ToBack = 'to_back',
}

export type TLSelectionHandle =
  | TLResizeCorner
  | TLResizeEdge
  | TLRotateCorner
  | 'rotate'
  | 'background'
  | 'center'

export interface TLBoundsWithCenter extends TLBounds {
  midX: number
  midY: number
}

export enum TLSnapPoints {
  minX = 'minX',
  midX = 'midX',
  maxX = 'maxX',
  minY = 'minY',
  midY = 'midY',
  maxY = 'maxY',
}

export type TLSnap =
  | { id: TLSnapPoints; isSnapped: false }
  | {
      id: TLSnapPoints
      isSnapped: true
      to: number
      B: TLBoundsWithCenter
      distance: number
    }

export interface TLTheme {
  accent?: string
  brushFill?: string
  brushStroke?: string
  selectFill?: string
  selectStroke?: string
  background?: string
  foreground?: string
  grid?: string
}

export interface TLBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
  rotation?: number
}

export interface TLBinding {
  id: string
  toId: string
  fromId: string
}

export interface TLOffset {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

/* --------------------- Events --------------------- */

export type TLSubscriptionEvent =
  | {
      event: 'mount'
      info: null
    }
  | {
      event: 'persist'
      info: null
    }
  | {
      event: 'save'
      info: null
    }
  | {
      event: 'saveAs'
      info: null
    }
  | {
      event: 'undo'
      info: null
    }
  | {
      event: 'redo'
      info: null
    }
  | {
      event: 'load'
      info: null
    }
  | {
      event: 'error'
      info: Error
    }

export type TLSubscriptionEventName = TLSubscriptionEvent['event']

export type TLSubscriptionEventInfo<E extends TLSubscriptionEventName> = Extract<
  TLSubscriptionEvent,
  { event: E }
>['info']

export type TLCallback<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>,
  E extends TLSubscriptionEventName = TLSubscriptionEventName
> = (app: R, info: TLSubscriptionEventInfo<E>) => void

export type TLSubscription<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>,
  E extends TLSubscriptionEventName = TLSubscriptionEventName
> = {
  event: E
  callback: TLCallback<S, K, R, E>
}

export type TLSubscribe<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>
> = {
  <E extends TLSubscriptionEventName>(subscription: TLSubscription<S, K, R, E>): () => void
  <E extends TLSubscriptionEventName>(event: E, callback: TLCallback<S, K, R, E>): () => void
}

export interface TLCallbacks<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  R extends TLApp<S, K> = TLApp<S, K>
> {
  onMount: TLCallback<S, K, R, 'mount'>
  onPersist: TLCallback<S, K, R, 'persist'>
  onSave: TLCallback<S, K, R, 'save'>
  onSaveAs: TLCallback<S, K, R, 'saveAs'>
  onError: TLCallback<S, K, R, 'error'>
}

/* ----------------- Event Handlers ----------------- */

export enum TLTargetType {
  Canvas = 'canvas',
  Shape = 'shape',
  Selection = 'selection',
  Handle = 'handle',
}

export type TLEventCanvasInfo = { type: TLTargetType.Canvas; order?: number }
export type TLEventShapeInfo<S extends TLShape> = {
  type: TLTargetType.Shape
  shape: S
  order?: number
}
export type TLEventHandleInfo<S extends TLShape, H extends TLHandle = TLHandle> = {
  type: TLTargetType.Handle
  shape: S
  handle: H
  index: number
  order?: number
}
export type TLEventSelectionInfo = {
  type: TLTargetType.Selection
  handle: TLSelectionHandle
  order?: number
}
export type TLEventInfo<S extends TLShape = TLShape> =
  | TLEventCanvasInfo
  | TLEventShapeInfo<S>
  | TLEventHandleInfo<S>
  | TLEventSelectionInfo

/* ----------------- Type Assertion ----------------- */

export function isStringArray(arr: string[] | any[]): asserts arr is string[] {
  if (arr[0] && typeof arr[0] !== 'string') {
    throw Error('Expected a string array.')
  }
}

/* ---------------------- Misc ---------------------- */

export type AnyObject = { [key: string]: any }

export type Merge<A, B> = Omit<A, keyof B> & B
