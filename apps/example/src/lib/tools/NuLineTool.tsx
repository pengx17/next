import { TLLineTool } from '@tldraw/core'
import type { TLReactEventMap } from '@tldraw/react'
import { Shape, NuLineShape } from '~lib'

export class NuLineTool extends TLLineTool<NuLineShape, Shape, TLReactEventMap> {
  static id = 'line'
  static shortcut = ['l']
  Shape = NuLineShape
}
