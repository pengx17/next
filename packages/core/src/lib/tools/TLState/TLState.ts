import type { TLShape } from '~lib'
import type { AnyObject, TLHandle, TLSelectionHandle, TLTargetType } from '~types'

export interface TLStateProps {}

export interface TLStateFlags {}

export type TLEventCanvasInfo = { type: TLTargetType.Canvas; order?: number }

export type TLEventShapeInfo = {
  type: TLTargetType.Shape
  shape: TLShape
  order?: number
}
export type TLEventHandleInfo<S extends TLShape = TLShape, H extends TLHandle = TLHandle> = {
  type: TLTargetType.Handle
  shape: S
  handle: H
  index: number
  order?: number
}
export type TLEventSelectionInfo = {
  type: TLTargetType.Selection
  handle: TLSelectionHandle
  order?: number
}
export type TLEventInfo =
  | TLEventCanvasInfo
  | TLEventShapeInfo
  | TLEventHandleInfo
  | TLEventSelectionInfo

export interface TLEventMap {
  wheel: AnyObject
  pointer: AnyObject
  touch: AnyObject
  keyboard: AnyObject
  gesture: AnyObject & {
    scale: number
    rotation: number
  }
}

export interface TLEvents<K extends TLEventMap = TLEventMap, E extends TLEventInfo = TLEventInfo> {
  wheel: (info: E & { delta: number[]; point: number[] }, event: K['wheel']) => TLState
  pinch: (
    info: E & { delta: number[]; point: number[]; offset: number[] },
    event: K['wheel'] | K['pointer'] | K['touch'] | K['keyboard'] | K['gesture']
  ) => TLState
  pointer: (info: E, event: K['pointer'] | K['wheel']) => TLState
  keyboard: (info: E, event: K['keyboard']) => TLState
}

export interface TLEventHandlers<
  K extends TLEventMap = TLEventMap,
  E extends TLEventInfo = TLEventInfo
> {
  onWheel: TLEvents<K, E>['wheel']
  onPointerDown: TLEvents<K, E>['pointer']
  onPointerUp: TLEvents<K, E>['pointer']
  onPointerMove: TLEvents<K, E>['pointer']
  onPointerEnter: TLEvents<K, E>['pointer']
  onPointerLeave: TLEvents<K, E>['pointer']
  onDoubleClick: TLEvents<K, E>['pointer']
  onKeyDown: TLEvents<K, E>['keyboard']
  onKeyUp: TLEvents<K, E>['keyboard']
  onPinchStart: TLEvents<K, E>['pinch']
  onPinch: TLEvents<K, E>['pinch']
  onPinchEnd: TLEvents<K, E>['pinch']
}

export interface TLStateMethods<
  K extends TLEventMap = TLEventMap,
  E extends TLEventInfo = TLEventInfo
> extends TLEventHandlers<K, E> {
  onEnter: (info: { fromId: string } & any) => void
  onExit: (info: { toId: string } & any) => void
  onTransition: (info: { toId: string; fromId: string } & any) => void
  onModifierKey: TLEvents<K, E>['keyboard']
}

export interface TLStateOptions extends Partial<TLStateFlags>, TLStateMethods {
  id: string
  initial?: string
  parent?: TLState
  children?: TLState[]
}

export interface TLState<K extends TLEventMap = TLEventMap>
  extends Partial<TLStateFlags>,
    Partial<TLStateMethods> {
  id: string
  isActive: boolean
  initial?: string
  currentState?: TLState
  children: Map<string, TLState>
  events: Required<TLStateMethods>
  registerStates(states: TLState[]): void
  deregisterStates(states: TLState[]): void
  dispose(): void
  registerKeyboardShortcuts(): void
  setCurrentState(state: TLState): void
  transition(id: string, data?: AnyObject): void
  isIn(path: string): boolean
  isInAny(...paths: string[]): boolean
  forwardEvent<E extends keyof TLStateMethods<K>, A extends Parameters<TLStateMethods<K>[E]>>(
    eventName: keyof TLStateMethods<K>,
    ...args: A
  ): void
}

export type TLStateFactory = (() => TLState) & { id: string }

function createState(this: TLState, options = {} as TLStateOptions & ThisType<TLState>): TLState {
  const { children, ...rest } = options
  this.isActive = false
  this.children = new Map()
  this.currentState = undefined
  this.setCurrentState = state => {
    this.currentState = state
  }
  this.registerStates = states => {
    states.forEach(state => this.children.set(state.id, state))
  }
  this.deregisterStates = states => {
    states.forEach(state => this.children.delete(state.id))
  }
  this.registerKeyboardShortcuts = () => {
    // todo
  }
  this.dispose = () => {
    // todo
  }
  this.forwardEvent = (eventName, ...args) => {
    if (this.currentState?.events?.[eventName]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.currentState.events?.[eventName](...args)
    }
  }
  this.transition = (id, data) => {
    if (this.children.size === 0)
      throw Error(`Tool ${this.id} has no states, cannot transition to ${id}.`)
    const nextState = this.children.get(id)
    const prevState = this.currentState
    if (!nextState) throw Error(`Could not find a state named ${id}.`)
    if (prevState) {
      prevState.events.onExit({ ...data, toId: id })
      prevState.dispose()
      nextState.registerKeyboardShortcuts()
      this.setCurrentState(nextState)
      this.events.onTransition({ ...data, fromId: prevState.id, toId: id })
      nextState.events.onEnter({ ...data, fromId: prevState.id })
    } else {
      this.currentState = nextState
      nextState.events.onEnter({ ...data, fromId: '' })
    }
  }
  this.isIn = path => {
    const ids = path.split('.').reverse()
    let state = this as TLState
    while (ids.length > 0) {
      const id = ids.pop()
      if (!id) return true
      if (state.currentState?.id === id) {
        if (ids.length === 0) return true
        state = state.currentState
        continue
      } else return false
    }
    return false
  }
  this.isInAny = (...paths) => {
    return paths.some(this.isIn)
  }
  this.events = {
    onEnter: info => {
      this.isActive = true
      if (this.initial) this.transition(this.initial, info)
      this.onEnter?.(info)
      return this
    },
    onExit: info => {
      this.isActive = false
      this.currentState?.onExit?.({ toId: 'parent' })
      this.onExit?.(info)
      return this
    },
    onTransition: info => {
      this.onTransition?.(info)
      return this
    },
    onWheel: (info, event) => {
      this.onWheel?.(info, event)
      this.forwardEvent('onWheel', info, event)
      return this
    },
    onPointerDown: (info, event) => {
      this.onPointerDown?.(info, event)
      this.forwardEvent('onPointerDown', info, event)
      return this
    },
    onPointerUp: (info, event) => {
      this.onPointerUp?.(info, event)
      this.forwardEvent('onPointerUp', info, event)
      return this
    },
    onPointerMove: (info, event) => {
      this.onPointerMove?.(info, event)
      this.forwardEvent('onPointerMove', info, event)
      return this
    },
    onPointerEnter: (info, event) => {
      this.onPointerEnter?.(info, event)
      this.forwardEvent('onPointerEnter', info, event)
      return this
    },
    onPointerLeave: (info, event) => {
      this.onPointerLeave?.(info, event)
      this.forwardEvent('onPointerLeave', info, event)
      return this
    },
    onDoubleClick: (info, event) => {
      this.onDoubleClick?.(info, event)
      this.forwardEvent('onDoubleClick', info, event)
      return this
    },
    onKeyDown: (info, event) => {
      this.events.onModifierKey(info, event)
      this.onKeyDown?.(info, event)
      this.forwardEvent('onKeyDown', info, event)
      return this
    },
    onKeyUp: (info, event) => {
      this.events.onModifierKey(info, event)
      this.onKeyUp?.(info, event)
      this.forwardEvent('onKeyUp', info, event)
      return this
    },
    onPinchStart: (info, event) => {
      this.onPinchStart?.(info, event)
      this.forwardEvent('onPinchStart', info, event)
      return this
    },
    onPinch: (info, event) => {
      this.onPinch?.(info, event)
      this.forwardEvent('onPinch', info, event)
      return this
    },
    onPinchEnd: (info, event) => {
      this.onPinchEnd?.(info, event)
      this.forwardEvent('onPinchEnd', info, event)
      return this
    },
    onModifierKey: (info, event) => {
      switch (event.key) {
        case 'Shift':
        case 'Alt':
        case 'Ctrl':
        case 'Meta': {
          this.events.onPointerMove(info, event)
          break
        }
      }
      return this
    },
  }
  Object.assign(this, rest)
  if (children) this.registerStates(children)
  if (this.initial) this.transition(this.initial)
  return this
}
