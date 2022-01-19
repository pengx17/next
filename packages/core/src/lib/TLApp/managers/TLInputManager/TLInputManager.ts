import type { TLApp, TLShape, TLUserState } from '../../..'
import type { TLEventMap } from '../../../../types'

export class TLInputManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
  }

  pointerIds = new Set<number>()

  private state: 'pointing' | 'pinching' | 'idle' = 'idle'

  private getModifiersUpdate(
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ): Partial<TLUserState> {
    const { userState } = this.app
    const changes: Partial<TLUserState> = {}
    if ('clientX' in event) {
      changes.previousScreenPoint = userState.currentScreenPoint
      changes.currentScreenPoint = [event.clientX, event.clientY]
    }
    if ('shiftKey' in event) {
      changes.shiftKey = event.shiftKey
      changes.ctrlKey = event.metaKey || event.ctrlKey
      changes.altKey = event.altKey
    }
    return changes
  }

  onWheel = (pagePoint: number[], event: K['wheel']) => {
    const { userState } = this.app
    // if (this.state === 'pinching') return
    this.app.updateUserState({
      ...this.getModifiersUpdate(event),
      previousPoint: userState.currentPoint,
      currentPoint: pagePoint,
    })
  }

  onPointerDown = (pagePoint: number[], event: K['pointer']) => {
    const { userState } = this.app
    // if (this.pointerIds.size > 0) return
    this.pointerIds.add(event.pointerId)
    this.app.updateUserState({
      ...this.getModifiersUpdate(event),
      originScreenPoint: userState.currentScreenPoint,
      originPoint: pagePoint,
    })
    this.state = 'pointing'
  }

  onPointerMove = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    if (this.state === 'pinching') return
    const { userState } = this.app
    // if ('pointerId' in event && !this.pointerIds.has(event.pointerId)) return
    this.app.updateUserState({
      ...this.getModifiersUpdate(event),
      previousPoint: userState.currentPoint,
      currentPoint: pagePoint,
    })
  }

  onPointerUp = (pagePoint: number[], event: K['pointer']) => {
    // if (!this.pointerIds.has(event.pointerId)) return
    this.pointerIds.clear()
    this.app.updateUserState(this.getModifiersUpdate(event))
    this.state = 'idle'
  }

  onKeyDown = (event: K['keyboard']) => {
    switch (event.key) {
      case ' ': {
        this.app.updateUserState({ ...this.getModifiersUpdate(event), spaceKey: true })
        break
      }
      default: {
        this.app.updateUserState(this.getModifiersUpdate(event))
      }
    }
  }

  onKeyUp = (event: K['keyboard']) => {
    switch (event.key) {
      case ' ': {
        this.app.updateUserState({ ...this.getModifiersUpdate(event), spaceKey: false })
        break
      }
      default: {
        this.app.updateUserState(this.getModifiersUpdate(event))
      }
    }
  }

  onPinchStart = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    this.app.updateUserState(this.getModifiersUpdate(event))
    this.state = 'pinching'
  }

  onPinch = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    if (this.state !== 'pinching') return
    this.app.updateUserState(this.getModifiersUpdate(event))
  }

  onPinchEnd = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    if (this.state !== 'pinching') return
    this.app.updateUserState(this.getModifiersUpdate(event))
    this.state = 'idle'
  }
}
