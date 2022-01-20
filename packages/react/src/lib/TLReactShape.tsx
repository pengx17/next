/* eslint-disable @typescript-eslint/no-explicit-any */
import { TLAsset, TLShape, TLShapeModel } from '@tldraw/core'

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
  new (props: S['props'] & { type: any }): S
  id: string
}

export abstract class TLReactShape<P extends TLShapeModel = TLShapeModel, M = any> extends TLShape<
  P,
  M
> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}
