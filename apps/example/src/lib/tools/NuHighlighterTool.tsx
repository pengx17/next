import { TLDrawTool } from '@tldraw/core'
import type { TLReactEventMap } from '@tldraw/react'
import { NuHighlighterShape, Shape } from '~lib'

export class NuHighlighterTool extends TLDrawTool<NuHighlighterShape, Shape, TLReactEventMap> {
  static id = 'highlighter'
  static shortcut = ['h']
  Shape = NuHighlighterShape
  simplify = true
  simplifyTolerance = 0.618
}
