import { reaction, toJS } from 'mobx'
import type { TLApp, TLDocumentModel } from '../../_TLApp'
import type { TLShape } from '../../_shapes/TLShape'
import type { TLEventMap } from '../../_types'
import * as fsp from 'fast-json-patch'

type Patch = fsp.Operation[]

export class TLHistoryManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>
  patches: Patch[] = []
  frame = -1
  skipNextFrame = false
  prev = {} as TLDocumentModel<S>
  state: 'stopped' | 'paused' | 'playing' = 'stopped'

  private didChangeWhilePaused = false

  constructor(app: TLApp<S, K>) {
    this.app = app
    reaction(() => toJS(this.app.document), this.persist)
  }

  // Manually push a patch based on the current document
  private pushFrame() {
    const snapshot = toJS(this.app.document)
    this.patches[this.frame] = fsp.compare(snapshot, this.prev)
    this.prev = snapshot
    this.app.events.notify('commit', null)
  }

  persist = (snapshot: TLDocumentModel<S>) => {
    const { didChangeWhilePaused, skipNextFrame, state, patches } = this
    if (skipNextFrame) {
      this.skipNextFrame = false
      return
    }

    switch (state) {
      case 'stopped': {
        break
      }
      case 'paused': {
        // Mark that we changed while paused
        if (!didChangeWhilePaused) {
          this.didChangeWhilePaused = true
        }
        break
      }
      case 'playing': {
        // Push a new frame
        this.frame++
        // Splice the patches, removing any pending redos
        if (patches.length > this.frame) patches.splice(0, this.frame)
        patches.push(fsp.compare(snapshot, this.prev))
        this.prev = snapshot
        this.app.events.notify('commit', null)
        break
      }
    }
  }

  undo = () => {
    if (this.state === 'paused') this.resume()
    if (this.frame < 0) return
    this.skipNextFrame = true
    const patch = this.patches[this.frame]
    this.app.patchDocument(patch)
    this.pushFrame()
    this.frame--
    this.app.events.notify('undo', null)
  }

  redo = () => {
    if (this.state === 'paused') this.resume()
    if (this.frame >= this.patches.length - 1) return
    this.skipNextFrame = true
    const patch = this.patches[this.frame + 1]
    this.app.patchDocument(patch)
    this.frame++
    this.pushFrame()
    this.app.events.notify('redo', null)
  }

  start = () => {
    if (this.state !== 'stopped') throw Error("Can't start a history manager that isn't stopped")
    this.prev = toJS(this.app.document)
    this.state = 'playing'
  }

  reset = () => {
    this.stop()
    this.start()
  }

  stop = () => {
    if (this.state === 'stopped') return
    this.patches = []
    this.frame = -1
    this.skipNextFrame = false
    this.didChangeWhilePaused = false
    this.state = 'stopped'
  }

  pause = () => {
    if (this.state === 'paused') return
    if (this.state !== 'playing') throw Error("Can't pause a history manager that isn't playing")
    this.state = 'paused'
    this.didChangeWhilePaused = false
  }

  resume = () => {
    if (this.state === 'playing') return
    if (this.state !== 'paused') throw Error("Can't resume a history manager that isn't paused")
    this.state = 'playing'
    // If we changed while paused, create a new frame before continuing.
    if (this.didChangeWhilePaused) {
      this.frame++
      this.pushFrame()
      this.didChangeWhilePaused = false
    }
  }
}
