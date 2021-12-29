import { TLDotTool } from '@tldraw/core'
import type { TLReactEventMap } from '@tldraw/react'
import { Shape, NuDotShape } from '~lib/shapes'

export class NuDotTool extends TLDotTool<NuDotShape, Shape, TLReactEventMap> {
  static id = 'dot'
  static shortcut = ['t']
  Shape = NuDotShape
}
