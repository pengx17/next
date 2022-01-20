import type { TLApp, TLShape } from '../../..'
import { TLCursor, TLEventMap } from '../../../../types'

export class TLCursorManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  reset = () => {
    this.app.updateUserState({ cursor: TLCursor.Default })
  }

  setCursor = (cursor: TLCursor, rotation = 0) => {
    const { cursor: currentCursor, cursorRotation } = this.app.userState
    if (cursor === currentCursor && rotation === cursorRotation) return
    this.app.updateUserState({ cursor, cursorRotation: rotation })
  }

  setRotation = (rotation: number) => {
    const { cursorRotation } = this.app.userState
    if (rotation === cursorRotation) return
    this.app.updateUserState({ cursorRotation: rotation })
  }
}
