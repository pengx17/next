import { toJS } from 'mobx'
import type { TLApp, TLDocumentModel } from './_TLApp'
import * as fsp from 'fast-json-patch'
import type { TLShape } from './_shapes/TLShape'
import type { TLEventMap } from './_types'

type Patch = fsp.Operation[]

export class TLHistoryManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>
  patches: Patch[] = []
  frame = -1
  skipNextFrame = false
  prev = {} as TLDocumentModel<S>
  paused = false

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  reset = () => {
    this.patches = []
    this.frame = -1
    this.skipNextFrame = false
    this.prev = toJS(this.app.document)
  }

  persist = (snapshot: TLDocumentModel<S>) => {
    const { skipNextFrame, paused, prev, patches } = this
    if (skipNextFrame) {
      this.skipNextFrame = false
      return
    }
    if (paused) {
      // Coalesce changes into the current frame
    } else {
      // Create a new frame
      this.frame++
      if (patches.length > this.frame) patches.splice(0, this.frame)
      patches.push(fsp.compare(snapshot, prev))
    }
    this.prev = snapshot
  }

  undo = () => {
    if (this.frame < 0) return
    this.skipNextFrame = true
    const patch = this.patches[this.frame]
    fsp.applyPatch(this.app.document, patch)
    const snapshot = toJS(this.app.document)
    this.patches[this.frame] = fsp.compare(snapshot, this.prev)
    this.prev = snapshot
    this.frame--
  }

  redo = () => {
    if (this.frame >= this.patches.length - 1) return
    this.skipNextFrame = true
    const patch = this.patches[this.frame + 1]
    fsp.applyPatch(this.app.document, patch)
    const snapshot = toJS(this.app.document)
    this.frame++
    this.patches[this.frame] = fsp.compare(snapshot, this.prev)
    this.prev = snapshot
  }

  pause = () => (this.paused = true)

  unpause = () => (this.paused = false)
}
