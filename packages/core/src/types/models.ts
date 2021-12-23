/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TLShapeWithHandles } from '~lib'
import type { TLHandle } from './TLHandle'
import type { Merge, TLBinding, TLResizeCorner, TLResizeEdge } from './types'

export type TLCustomProps<T = any> = Merge<TLShapeProps, T>
//  & {
//   [K in keyof T]: K extends keyof TLShapeProps ? never : T[K]
// }

export interface TLShapeProps {
  id: string
  type: string
  nonce?: number
  parentId: string
  point: number[]
  rotation?: number
  name?: string
  isGhost?: boolean
  isHidden?: boolean
  isLocked?: boolean
  isGenerated?: boolean
  isAspectRatioLocked?: boolean
}

export interface TLResizeInfo<P = any> {
  type: TLResizeEdge | TLResizeCorner
  scale: number[]
  transformOrigin: number[]
  initialShape: TLShapeModel<P>
}

export interface TLHandleChangeInfo<H extends TLHandle, P extends { handles: H[] }> {
  index: number
  delta: number[]
  initialShape: TLShapeWithHandles<H, P>
}

export type TLShapeModel<P = any> = P & TLShapeProps

export interface TLPageModel {
  id: string
  name: string
  shapes: TLShapeModel[]
  bindings: TLBinding[]
  nonce?: number
}

export interface TLDocumentModel {
  id: string
  pages: TLPageModel[]
}

export interface TLAppStateModel {
  currentPageId: string
  selectedIds: string[]
}

export interface TLSerialized {
  document: TLDocumentModel
  state: TLAppStateModel
}
