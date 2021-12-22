import type { AnyObject, TLBinding } from './types'

export interface TLShapeProps {
  id: string
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

export type TLShapeModel<P extends AnyObject = AnyObject> = TLShapeProps & {
  type: string
  nonce?: number
} & P

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
