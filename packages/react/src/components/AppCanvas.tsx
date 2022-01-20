/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { observer } from 'mobx-react-lite'
import type { TLReactShape } from '~lib'
import { useApp } from '~hooks'
import type { AppProps } from './App'
import { Renderer } from './Renderer'

export const AppCanvas = observer(function InnerApp<S extends TLReactShape>(
  props: AppProps<S>
): JSX.Element {
  const app = useApp<S>()

  return (
    <Renderer
      inputs={app.inputs}
      callbacks={app._events as any}
      brush={app.userState.brush}
      editingShape={app.editingShape}
      hoveredShape={app.hoveredShape}
      selectionDirectionHint={app.userState.selectionDirectionHint}
      selectionBounds={app.selectionBounds}
      selectedShapes={app.selectedShapesArray}
      erasingShapes={app.erasingShapesArray}
      shapes={app.shapesInViewport}
      // assets={app.assets}
      camera={app.userState.camera}
      showGrid={app.userSettings.showGrid}
      showSelection={app.userState.showSelection}
      showSelectionRotation={app.userState.showSelectionRotation}
      showResizeHandles={app.userState.showResizeHandles}
      showRotateHandles={app.userState.showRotateHandles}
      showSelectionDetail={app.userState.showSelectionDetail}
      showContextBar={app.userState.showContextBar}
      cursor={app.userState.cursor}
      cursorRotation={app.userState.cursorRotation}
      selectionRotation={app.selectionRotation}
      onEditingEnd={app.clearEditingShape}
      {...props}
    />
  )
})
