import { TLShape, TLShapeProps } from '@tldraw/core'

export interface TLCommonShapeProps<M = unknown> {
  meta: M
  isEditing: boolean
  isBinding: boolean
  isHovered: boolean
  isSelected: boolean
  isErasing: boolean
}

export type TLIndicatorProps<M = unknown> = TLCommonShapeProps<M>

export interface TLComponentProps<M = unknown> extends TLCommonShapeProps<M> {
  events: {
    onPointerMove: React.PointerEventHandler
    onPointerDown: React.PointerEventHandler
    onPointerUp: React.PointerEventHandler
    onPointerEnter: React.PointerEventHandler
    onPointerLeave: React.PointerEventHandler
    onKeyUp: React.KeyboardEventHandler
    onKeyDown: React.KeyboardEventHandler
  }
}

export interface TLReactShapeConstructor<S extends TLReactShape = TLReactShape> {
  new (props: Partial<S['props']>): S
  id: string
}

export abstract class TLReactShape<P extends TLShapeProps = TLShapeProps, M = any> extends TLShape<
  P,
  M
> {
  abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
}

// export abstract class TLReactShapeWithHandles<
//   P extends { handles: TLHandle[] } = any,
//   H extends TLHandle = TLHandle,
//   M = any
// > extends TLShapeWithHandles<P, H, M> {
//   abstract ReactComponent: (props: TLComponentProps<M>) => JSX.Element | null
//   abstract ReactIndicator: (props: TLIndicatorProps<M>) => JSX.Element | null
// }
