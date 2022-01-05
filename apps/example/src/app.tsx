/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import documentModel from './models/empty'
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
  LineShape,
  PenShape,
  PolygonShape,
  PolylineShape,
  StarShape,
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
  YouTubeTool,
} from '~lib/tools'
import { AppUI } from '~components/AppUI'
import { ContextBar } from '~components/ContextBar/ContextBar'
import { AppCanvas, AppProvider } from '@tldraw/react'

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
    LineShape,
    PenShape,
    PolygonShape,
    PolylineShape,
    StarShape,
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
    YouTubeTool,
  ])

  const [model, setModel] = React.useState<TLDocumentModel<Shape>>(documentModel)

  const onMount = React.useCallback<TLReactCallbacks<Shape>['onMount']>(app => {
    setApp(app)
    // app.selectAll()
  }, [])

  const onPersist = React.useCallback<TLReactCallbacks<Shape>['onPersist']>(() => {
    // todo
  }, [])

  return (
    <AppProvider
      onMount={onMount}
      onPersist={onPersist}
      model={model}
      Shapes={Shapes}
      Tools={Tools}
    >
      <div className="wrapper">
        <AppCanvas components={components} />
        <AppUI />
      </div>
    </AppProvider>
  )
}

export default App
