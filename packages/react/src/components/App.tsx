/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { observer } from 'mobx-react-lite'
import type { TLReactApp, TLReactShape, TLReactShapeConstructor } from '~lib'
import { AppContext, Renderer } from '~components'
import { useApp } from '~hooks'
import type {
  AnyObject,
  TLDocumentModel,
  TLCallback,
  TLTheme,
  TLToolConstructor,
} from '@tldraw/core'
import type { TLReactComponents } from '~types/component-props'
import type { TLReactEventMap } from '~types'

export interface TLCommonAppProps<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> {
  id?: string
  meta?: AnyObject
  theme?: Partial<TLTheme>
  components?: TLReactComponents<S>
  children?: React.ReactNode
  onMount?: TLCallback<S, TLReactEventMap, R, 'mount'>
  onPersist?: TLCallback<S, TLReactEventMap, R, 'persist'>
  onSave?: TLCallback<S, TLReactEventMap, R, 'save'>
  onSaveAs?: TLCallback<S, TLReactEventMap, R, 'saveAs'>
  onLoad?: TLCallback<S, TLReactEventMap, R, 'load'>
  onUndo?: TLCallback<S, TLReactEventMap, R, 'undo'>
  onRedo?: TLCallback<S, TLReactEventMap, R, 'redo'>
  onError?: TLCallback<S, TLReactEventMap, R, 'error'>
}

export interface TLAppPropsWithoutApp<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> extends TLCommonAppProps<S, R> {
  model?: TLDocumentModel
  Shapes?: TLReactShapeConstructor<S>[]
  Tools?: TLToolConstructor<S, TLReactEventMap, TLReactApp<S>>[]
  children?: React.ReactNode
}

export interface TLAppPropsWithApp<
  S extends TLReactShape = TLReactShape,
  R extends TLReactApp<S> = TLReactApp<S>
> extends TLCommonAppProps<S, R> {
  app: R
  children?: React.ReactNode
}

export type AppProps<S extends TLReactShape = TLReactShape> =
  | TLAppPropsWithoutApp<S>
  | TLAppPropsWithApp<S>

export function App<S extends TLReactShape>(props: AppProps<S>): JSX.Element {
  return (
    <AppContext {...props}>
      <InnerApp {...props} />
    </AppContext>
  )
}

const InnerApp = observer(function InnerApp<S extends TLReactShape>(
  props: AppProps<S>
): JSX.Element {
  const app = useApp<S>()

  return (
    <Renderer
      viewport={app.viewport}
      inputs={app.inputs}
      callbacks={app._events as any}
      brush={app.brush}
      editingShape={app.editingShape}
      hoveredShape={app.hoveredShape}
      selectionBounds={app.selectionBounds}
      selectedShapes={app.selectedShapesArray}
      erasingShapes={app.erasingShapesArray}
      shapes={app.shapesInViewport}
      showGrid={app.settings.showGrid}
      showSelection={app.showSelection}
      showSelectionRotation={app.showSelectionRotation}
      showResizeHandles={app.showResizeHandles}
      showRotateHandles={app.showRotateHandles}
      showSelectionDetail={app.showSelectionDetail}
      showContextBar={app.showContextBar}
      cursor={app.cursors.cursor}
      cursorRotation={app.cursors.rotation}
      selectionRotation={app.selectionRotation}
      {...props}
    />
  )
})
