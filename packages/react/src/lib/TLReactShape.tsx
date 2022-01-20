/* eslint-disable @typescript-eslint/no-explicit-any */
import { TLAsset, TLShape, TLShapeModel } from '@tldraw/core'
import type { TLReactApp } from './TLReactApp'

export interface TLCommonShapeModel<M = unknown> {
  meta: M
  isEditing: boolean
  isBinding: boolean
  isHovered: boolean
  isSelected: boolean
  isErasing: boolean
  asset?: TLAsset
}

export type TLIndicatorProps<M = unknown> = TLCommonShapeModel<M>

export interface TLComponentProps<M = unknown> extends TLCommonShapeModel<M> {
  events: {
    onPointerMove: React.PointerEventHandler
    onPointerDown: React.PointerEventHandler
    onPointerUp: React.PointerEventHandler
    onPointerEnter: React.PointerEventHandler
    onPointerLeave: React.PointerEventHandler
    onKeyUp: React.KeyboardEventHandler
    onKeyDown: React.KeyboardEventHandler
  }
  onEditingEnd: () => void
}

export interface TLReactShapeConstructor<S extends TLReactShape = TLReactShape> {
  new (app: TLReactApp<S>, id: string): S
  type: string
}

export abstract class TLReactShape<P extends TLShapeModel = TLShapeModel> extends TLShape<P> {
  abstract ReactComponent: (props: TLComponentProps) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps) => JSX.Element | null
}
