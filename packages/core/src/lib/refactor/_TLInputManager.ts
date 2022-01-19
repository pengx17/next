import { action, makeObservable, observable } from 'mobx'
import type { TLApp, TLShape, TLUserState } from '.'
import type { TLEventMap } from './_types'

export class TLInputManager<S extends TLShape = TLShape, K extends TLEventMap = TLEventMap> {
  app: TLApp<S, K>

  constructor(app: TLApp<S, K>) {
    this.app = app
    makeObservable(this)
  }

  pointerIds = new Set<number>()

  @observable state: 'pointing' | 'pinching' | 'idle' = 'idle'

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

  @action onWheel = (pagePoint: number[], event: K['wheel']) => {
    const { userState } = this.app
    // if (this.state === 'pinching') return
    this.app.updateUserState({
      ...this.getModifiersUpdate(event),
      previousPoint: userState.currentPoint,
      currentPoint: pagePoint,
    })
  }

  @action onPointerDown = (pagePoint: number[], event: K['pointer']) => {
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

  @action onPointerMove = (
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

  @action onPointerUp = (pagePoint: number[], event: K['pointer']) => {
    // if (!this.pointerIds.has(event.pointerId)) return
    this.pointerIds.clear()
    this.app.updateUserState(this.getModifiersUpdate(event))
    this.state = 'idle'
  }

  @action onKeyDown = (event: K['keyboard']) => {
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

  @action onKeyUp = (event: K['keyboard']) => {
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

  @action onPinchStart = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    this.app.updateUserState(this.getModifiersUpdate(event))
    this.state = 'pinching'
  }

  @action onPinch = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    if (this.state !== 'pinching') return
    this.app.updateUserState(this.getModifiersUpdate(event))
  }

  @action onPinchEnd = (
    pagePoint: number[],
    event: K['gesture'] | K['pointer'] | K['keyboard'] | K['wheel'] | K['touch']
  ) => {
    if (this.state !== 'pinching') return
    this.app.updateUserState(this.getModifiersUpdate(event))
    this.state = 'idle'
  }
}
