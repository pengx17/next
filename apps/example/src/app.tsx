/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import documentModel from './models/withAsset'
import { fileToBase64, getSizeFromDataurl, TLAsset, TLDocumentModel, uniqueId } from '@tldraw/core'
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
    ImageShape,
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

  const onFileDrop = React.useCallback<TLReactCallbacks<Shape>['onFileDrop']>(
    async (app, { files, point }) => {
      const IMAGE_EXTENSIONS = ['.png', '.svg', '.jpg', '.jpeg', '.gif']
      const assetId = uniqueId()
      interface ImageAsset extends TLAsset {
        size: number[]
      }
      const assetsToCreate: ImageAsset[] = []
      for (const file of files) {
        console.log('hello', file)
        try {
          // Get extension, verify that it's an image
          const extensionMatch = file.name.match(/\.[0-9a-z]+$/i)
          if (!extensionMatch) throw Error('No extension.')
          const extension = extensionMatch[0].toLowerCase()
          if (!IMAGE_EXTENSIONS.includes(extension)) continue
          // Turn the image into a base64 dataurl
          const dataurl = await fileToBase64(file)
          if (typeof dataurl !== 'string') continue
          // Do we already have an asset for this image?
          const existingAsset = Object.values(app.assets).find(asset => asset.src === dataurl)
          if (existingAsset) {
            assetsToCreate.push(existingAsset as ImageAsset)
            continue
          }
          // Create a new asset for this image
          const asset: ImageAsset = {
            id: assetId,
            type: 'image',
            src: dataurl,
            size: await getSizeFromDataurl(dataurl),
          }
          assetsToCreate.push(asset)
        } catch (error) {
          console.error(error)
        }
      }
      app.createAssets(assetsToCreate)
      app.createShapes(
        assetsToCreate.map((asset, i) => ({
          id: uniqueId(),
          type: 'image',
          parentId: app.currentPageId,
          point: [point[0] - asset.size[0] / 2 + i * 16, point[1] - asset.size[1] / 2 + i * 16],
          size: asset.size,
          assetId: asset.id,
          opacity: 1,
        }))
      )
      console.log(app.shapes)
    },
    []
  )

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
