/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import type { TLDocumentModel } from '@tldraw/core'
import type {
  TLReactApp,
  TLReactComponents,
  TLReactShapeConstructor,
  TLReactCallbacks,
  TLReactToolConstructor,
} from '@tldraw/react'
import {
  BoxShape,
  CodeSandboxShape,
  DotShape,
  EllipseShape,
  HighlighterShape,
  ImageShape,
  LineShape,
  PenShape,
  PolygonShape,
  PolylineShape,
  StarShape,
  TextShape,
  YouTubeShape,
  Shape,
} from '~lib/shapes'
import {
  BoxTool,
  CodeSandboxTool,
  DotTool,
  EllipseTool,
  NuEraseTool,
  HighlighterTool,
  LineTool,
  PenTool,
  PolygonTool,
  StarTool,
  TextTool,
  YouTubeTool,
} from '~lib/tools'
import { AppUI } from '~components/AppUI'
import { ContextBar } from '~components/ContextBar/ContextBar'
import { AppCanvas, AppProvider } from '@tldraw/react'
import { useFileDrop } from '~hooks/useFileDrop'
import documentModel from './documents/dev'

const components: TLReactComponents<Shape> = {
  ContextBar: ContextBar,
}

function App(): JSX.Element {
  const [app, setApp] = React.useState<TLReactApp<Shape>>()

  const [Shapes] = React.useState<TLReactShapeConstructor<Shape>[]>(() => [
    BoxShape,
    CodeSandboxShape,
    DotShape,
    EllipseShape,
    HighlighterShape,
    ImageShape,
    LineShape,
    PenShape,
    PolygonShape,
    PolylineShape,
    StarShape,
    TextShape,
    YouTubeShape,
  ])

  const [Tools] = React.useState<TLReactToolConstructor<Shape>[]>(() => [
    BoxTool,
    CodeSandboxTool,
    DotTool,
    EllipseTool,
    NuEraseTool,
    HighlighterTool,
    LineTool,
    PenTool,
    PolygonTool,
    StarTool,
    TextTool,
    YouTubeTool,
  ])

  const [model, setModel] = React.useState<TLDocumentModel<Shape>>(documentModel)

  const onMount = React.useCallback<TLReactCallbacks<Shape>['onMount']>(app => {
    setApp(app)
    // app.selectAll()
  }, [])

  const onPersist = React.useCallback<TLReactCallbacks<Shape>['onPersist']>(() => {
    // noop
  }, [])

  const onCreateAssets = React.useCallback<TLReactCallbacks<Shape>['onCreateAssets']>(
    (assets, point) => {
      //  noop
    },
    []
  )

  const onFileDrop = useFileDrop()

  return (
    <AppProvider
      model={model}
      Shapes={Shapes}
      Tools={Tools}
      onMount={onMount}
      onPersist={onPersist}
      onCreateAssets={onCreateAssets}
      onFileDrop={onFileDrop}
    >
      <div className="wrapper">
        <AppCanvas components={components} />
        <AppUI />
      </div>
    </AppProvider>
  )
}

export default App
