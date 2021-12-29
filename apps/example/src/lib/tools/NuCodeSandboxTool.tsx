import { TLBoxTool } from '@tldraw/core'
import type { TLReactEventMap } from '@tldraw/react'
import { Shape, NuCodeSandboxShape } from '~lib/shapes'

export class NuCodeSandboxTool extends TLBoxTool<NuCodeSandboxShape, Shape, TLReactEventMap> {
  static id = 'code'
  static shortcut = ['x']
  Shape = NuCodeSandboxShape
}
