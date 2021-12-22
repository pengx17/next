import { AnyObject, TLHandle, TLShape, TLShapeProps, TLShapeWithHandles } from '@tldraw/core'
import type { TLReactApp } from '~types'

export interface TLCommonShapeProps {
  isEditing: boolean
  isBinding: boolean
  isHovered: boolean
  isSelected: boolean
  isErasing: boolean
}

export type TLIndicatorProps = TLCommonShapeProps

export interface TLComponentProps extends TLCommonShapeProps {
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

export interface TLReactShapeConstructor<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> {
  new (app: R, pageId: string, id: string): S
  id: string
}

// export interface TLReactShapeConstructor<S extends TLReactShape = TLReactShape> {
//   new (props: any): S
//   id: string
// }

export abstract class TLReactShape<P extends AnyObject = AnyObject> extends TLShape<
  P,
  TLReactApp<any>
> {
  abstract ReactComponent: (props: TLComponentProps) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps) => JSX.Element | null
}

export abstract class TLReactShapeWithHandles<
  H extends TLHandle = TLHandle,
  P extends { handles: H[] } = any
> extends TLShapeWithHandles<H, P, TLReactApp<any>> {
  abstract ReactComponent: (props: TLComponentProps) => JSX.Element | null
  abstract ReactIndicator: (props: TLIndicatorProps) => JSX.Element | null
}
