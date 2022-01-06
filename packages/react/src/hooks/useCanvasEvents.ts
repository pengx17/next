import * as React from 'react'
import { useRendererContext } from '~hooks'
import { TLAsset, TLTargetType, uniqueId } from '@tldraw/core'
import type { TLReactCustomEvents } from '~types'
import { useApp } from './useApp'
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '~constants'

export function useCanvasEvents() {
  const app = useApp()
  const { callbacks } = useRendererContext()

  const events = React.useMemo(() => {
    const onPointerMove: TLReactCustomEvents['pointer'] = e => {
      const { order = 0 } = e
      callbacks.onPointerMove?.({ type: TLTargetType.Canvas, order }, e)
    }

    const onPointerDown: TLReactCustomEvents['pointer'] = e => {
      const { order = 0 } = e
      if (!order) e.currentTarget?.setPointerCapture(e.pointerId)
      callbacks.onPointerDown?.({ type: TLTargetType.Canvas, order }, e)
    }

    const onPointerUp: TLReactCustomEvents['pointer'] = e => {
      const { order = 0 } = e
      if (!order) e.currentTarget?.releasePointerCapture(e.pointerId)
      callbacks.onPointerUp?.({ type: TLTargetType.Canvas, order }, e)
    }

    const onPointerEnter: TLReactCustomEvents['pointer'] = e => {
      const { order = 0 } = e
      callbacks.onPointerEnter?.({ type: TLTargetType.Canvas, order }, e)
    }

    const onPointerLeave: TLReactCustomEvents['pointer'] = e => {
      const { order = 0 } = e
      callbacks.onPointerLeave?.({ type: TLTargetType.Canvas, order }, e)
    }

    const onKeyDown: TLReactCustomEvents['keyboard'] = e => {
      callbacks.onKeyDown?.({ type: TLTargetType.Canvas, order: -1 }, e)
    }

    const onKeyUp: TLReactCustomEvents['keyboard'] = e => {
      callbacks.onKeyUp?.({ type: TLTargetType.Canvas, order: -1 }, e)
    }

    const onDrop = async (e: React.DragEvent<Element>) => {
      e.preventDefault()
      if (!e.dataTransfer.files?.length) return
      const point = [e.clientX, e.clientY]
      const assetId = uniqueId()
      const assetsToCreate: TLAsset[] = []
      for (const file of Array.from(e.dataTransfer.files)) {
        try {
          const dataurl = callbacks.onFileDrop
            ? await callbacks.onFileDrop(file)
            : await fileToBase64(file)
          if (typeof dataurl === 'string') {
            const extensionMatch = file.name.match(/\.[0-9a-z]+$/i)
            if (!extensionMatch) throw Error('No extension')
            const extension = extensionMatch[0].toLowerCase()
            const isImage = IMAGE_EXTENSIONS.includes(extension)
            const isVideo = VIDEO_EXTENSIONS.includes(extension)
            if (!(isImage || isVideo)) throw Error(`Unknown extension: ${extension}`)
            const assetType = isImage ? 'image' : 'video'
            const size = isImage ? await getSizeFromDataurl(dataurl) : [401.42, 401.42] // special
            const existingAsset = Object.values(app.assets).find(
              asset => asset.type === assetType && asset.src === dataurl
            )
            if (existingAsset) {
              assetsToCreate.push(existingAsset)
            } else {
              const asset = {
                id: assetId,
                type: assetType,
                src: dataurl,
                size,
              } as TLAsset
              assetsToCreate.push(asset)
            }
          }
        } catch (error) {
          console.error(error)
        }
      }
      app.createAssets(assetsToCreate, point)
    }

    const onDragOver = (e: React.DragEvent<Element>) => {
      e.preventDefault()
    }

    return {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
      onKeyUp,
      onPointerEnter,
      onPointerLeave,
      onDrop,
      onDragOver,
    }
  }, [callbacks])

  return events
}

function fileToBase64(file: Blob): Promise<string | ArrayBuffer | null> {
  return new Promise((resolve, reject) => {
    if (file) {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
      reader.onabort = error => reject(error)
    }
  })
}

function getSizeFromDataurl(dataURL: string): Promise<number[]> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve([img.width, img.height])
    img.src = dataURL
  })
}
