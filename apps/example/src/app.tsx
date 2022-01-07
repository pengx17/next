/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import documentModel from './models/empty'
import type { TLDocumentModel } from '@tldraw/core'
import {
  TLReactApp,
  TLReactComponents,
  TLReactShapeConstructor,
  TLReactCallbacks,
  TLReactToolConstructor,
  useApp,
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
import { Observer } from 'mobx-react-lite'
import { autorun, reaction } from 'mobx'

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

  const onCreateAssets = React.useCallback<TLReactCallbacks<Shape>['onCreateAssets']>(
    (assets, point) => {
      console.log('assets created', assets, point)
      // create image or video element
    },
    []
  )

  const onFileDrop = React.useCallback<TLReactCallbacks<Shape>['onFileDrop']>(async files => {
    console.log('File dropped', files)
    // create image or video element
  }, [])

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
        <PatchObserver />
        <AppCanvas components={components} />
        <AppUI />
      </div>
    </AppProvider>
  )
}

export default App

function PatchObserver() {
  const app = useApp()
  const cache = React.useRef<{ patch: any; time: number }[]>([])

  React.useEffect(() => {
    reaction(
      () => app.serialized,
      app => {
        console.log('changed')
      }
    )
  })

  return null
}
