import { TLBoxTool } from '@tldraw/core'
import type { TLReactEventMap } from '@tldraw/react'
import { NuEllipseShape, Shape } from '~lib'

export class NuEllipseTool extends TLBoxTool<NuEllipseShape, Shape, TLReactEventMap> {
  static id = 'ellipse'
  static shortcut = ['o']
  Shape = NuEllipseShape
}
