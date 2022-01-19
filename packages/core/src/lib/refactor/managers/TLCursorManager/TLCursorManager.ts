import type { TLApp, TLShape } from '../..'
import { TLCursor, TLEventMap } from '../../types'

export class TLCursorManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  reset = () => {
    this.app.updateDisplayState({ cursor: TLCursor.Default })
  }

  setCursor = (cursor: TLCursor, rotation = 0) => {
    const { cursor: currentCursor, cursorRotation } = this.app.displayState
    if (cursor === currentCursor && rotation === cursorRotation) return
    this.app.updateDisplayState({ cursor, cursorRotation: rotation })
  }

  setRotation = (rotation: number) => {
    const { cursorRotation } = this.app.displayState
    if (rotation === cursorRotation) return
    this.app.updateDisplayState({ cursorRotation: rotation })
  }
}
