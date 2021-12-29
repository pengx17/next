/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import type { TLDocumentModel } from '@tldraw/core'
import {
  App as TLDrawApp,
  TLReactApp,
  TLReactComponents,
  TLReactShapeConstructor,
  TLReactCallbacks,
  TLReactToolConstructor,
} from '@tldraw/react'
import {
  NuBoxShape,
  // NuEllipseShape,
  // NuPolygonShape,
  // NuPenShape,
  // NuHighlighterShape,
  // NuDotShape,
  // NuStarShape,
  // NuLineShape,
  // NuPolylineShape,
  // NuCodeSandboxShape,
  // NuYouTubeShape,
  Shape,
} from '~lib/shapes'
import {
  NuBoxTool,
  // NuEllipseTool,
  // NuPolygonTool,
  // NuPenTool,
  // NuHighlighterTool,
  // NuDotTool,
  // NuEraseTool,
  // NuStarTool,
  // NuLineTool,
  // NuCodeSandboxTool,
  // NuYouTubeTool,
} from '~lib/tools'
import { AppUI } from '~components/AppUI'
import { NuContextBar } from '~components/NuContextBar/NuContextBar'

const components: TLReactComponents<Shape> = {
  ContextBar: NuContextBar,
}

function App(): JSX.Element {
  const [app, setApp] = React.useState<TLReactApp<Shape>>()

  const [Shapes] = React.useState<TLReactShapeConstructor<Shape>[]>(() => [
    NuBoxShape,
    // NuEllipseShape,
    // NuPolygonShape,
    // NuPenShape,
    // NuHighlighterShape,
    // NuDotShape,
    // NuStarShape,
    // NuPolylineShape,
    // NuLineShape,
    // NuCodeSandboxShape,
    // NuYouTubeShape,
  ])

  const [Tools] = React.useState<TLReactToolConstructor<Shape>[]>(() => [
    NuBoxTool,
    // NuEllipseTool,
    // NuPolygonTool,
    // NuPenTool,
    // NuHighlighterTool,
    // NuDotTool,
    // NuStarTool,
    // NuEraseTool,
    // NuLineTool,
    // NuCodeSandboxTool,
    // NuYouTubeTool,
  ])

  const [model] = React.useState<TLDocumentModel>({
    currentPageId: 'page1',
    selectedIds: [],
    pages: [
      {
        name: 'Page',
        id: 'page1',
        shapes: [
          // ...Array.from(Array(50)).flatMap((_, i) =>
          //   Array.from(Array(50)).map((_, j) => ({
          //     id: 'box' + '_' + i + '_' + j,
          //     type: 'box',
          //     parentId: 'page1',
          //     point: [((i * 50 + j) % 50) * 150, Math.floor((i * 50 + j) / 50) * 150],
          //     size: [100, 100],
          //   }))
          // ),
          // {
          //   id: 'box0',
          //   type: 'box',
          //   parentId: 'page1',
          //   point: [300, 200],
          //   size: [100, 100],
          // },
          // {
          //   id: 'box1',
          //   type: 'box',
          //   parentId: 'page1',
          //   point: [100, 400],
          //   size: [100, 100],
          //   rotation: Math.PI / 6,
          // },
          // {
          //   id: 'code1',
          //   type: 'code',
          //   parentId: 'page1',
          //   point: [300, 400],
          //   size: [100, 100],
          // },
          // {
          //   id: 'polyline1',
          //   type: 'polyline',
          //   parentId: 'page1',
          //   point: [100, 100],
          //   handles: [{ point: [0, 0] }, { point: [30, 70] }, { point: [100, 100] }],
          // },
          // {
          //   id: 'line1',
          //   type: 'line',
          //   parentId: 'page1',
          //   point: [300, 100],
          //   handles: [{ point: [0, 0] }, { point: [230, 270] }],
          // },
          // {
          //   id: 'dot1',
          //   type: 'dot',
          //   parentId: 'page1',
          //   point: [500, 300],
          //   radius: 3,
          // },
          // {
          //   id: 'ellipse1',
          //   type: 'ellipse',
          //   parentId: 'page1',
          //   point: [100, 100],
          //   size: [100, 200],
          //   rotation: Math.PI / 6,
          // },
          // {
          //   id: 'polygon2',
          //   type: 'polygon',
          //   parentId: 'page1',
          //   point: [100, 300],
          //   size: [150, 150],
          //   sides: 5,
          //   ratio: 1,
          // },
          // {
          //   id: 'draw1',
          //   type: 'draw',
          //   parentId: 'page1',
          //   point: [100, 100],
          //   points: [
          //     [0, 0, 0.5],
          //     [10, 10, 0.5],
          //     [20, 20, 0.5],
          //     [30, 20, 0.5],
          //     [40, 20, 0.5],
          //     [20, 60, 0.5],
          //   ],
          //   isComplete: true,
          // },
          // {
          //   id: 'polygon3',
          //   type: 'polygon',
          //   parentId: 'page1',
          //   point: [300, 300],
          //   size: [150, 150],
          //   sides: 5,
          //   ratio: 0.5,
          // },
          // {
          //   id: 'polygon4',
          //   type: 'polygon',
          //   parentId: 'page1',
          //   point: [500, 300],
          //   size: [150, 150],
          //   sides: 5,
          //   ratio: 1,
          // },
          // {
          //   id: 'star1',
          //   type: 'star',
          //   parentId: 'page1',
          //   point: [100, 500],
          //   size: [150, 150],
          //   points: 5,
          //   ratio: 1,
          // },
          // {
          //   id: 'star2',
          //   type: 'star',
          //   parentId: 'page1',
          //   point: [300, 500],
          //   size: [150, 150],
          //   points: 5,
          //   ratio: 0.5,
          // },
          // {
          //   id: 'star3',
          //   type: 'star',
          //   parentId: 'page1',
          //   point: [500, 500],
          //   size: [150, 150],
          //   points: 5,
          //   ratio: 1,
          // },
        ],
        bindings: [],
      },
    ],
  })

  const onMount = React.useCallback<TLReactCallbacks<Shape>['onMount']>(app => {
    setApp(app)
    // app.selectAll()
  }, [])

  const onPersist = React.useCallback<TLReactCallbacks<Shape>['onPersist']>(() => {
    // todo
  }, [])

  return (
    <div className="tl-app">
      <TLDrawApp
        onMount={onMount}
        onPersist={onPersist}
        model={model}
        components={components}
        Shapes={Shapes}
        Tools={Tools}
      >
        <AppUI />
      </TLDrawApp>
    </div>
  )
}

export default App
