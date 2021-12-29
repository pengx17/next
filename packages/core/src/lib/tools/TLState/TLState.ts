/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { action, makeObservable, observable } from 'mobx'
import type { TLShape } from '~lib'
import type { AnyObject, TLCursor, TLHandle, TLSelectionHandle, TLTargetType } from '~types'
import { KeyUtils } from '~utils'

export type TLShortcut<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap
> = {
  keys: string | string[]
  fn: (root: TLState<any, S, K> | undefined, state: TLState<C, S, K>, event: KeyboardEvent) => void
}

export type TLEventCanvasInfo = { type: TLTargetType.Canvas; order?: number }

export type TLEventShapeInfo<S extends TLShape = TLShape> = {
  type: TLTargetType.Shape
  shape: S
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
export type TLEventInfo<S extends TLShape = TLShape> =
  | TLEventCanvasInfo
  | TLEventShapeInfo<S>
  | TLEventHandleInfo<S>
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

export interface TLEvents<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  E extends TLEventInfo<S> = TLEventInfo<S>
> {
  wheel: (info: E & { delta: number[]; point: number[] }, event: K['wheel']) => TLState<C, S, K>
  pinch: (
    info: E & { delta: number[]; point: number[]; offset: number[] },
    event: K['wheel'] | K['pointer'] | K['touch'] | K['keyboard'] | K['gesture']
  ) => TLState<C, S, K>
  pointer: (info: E, event: K['pointer'] | K['wheel']) => TLState<C, S, K>
  keyboard: (info: E, event: K['keyboard']) => TLState<C, S, K>
}

export interface TLEventHandlers<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  E extends TLEventInfo<S> = TLEventInfo<S>
> {
  onWheel: TLEvents<C, S, K, E>['wheel']
  onPointerDown: TLEvents<C, S, K, E>['pointer']
  onPointerUp: TLEvents<C, S, K, E>['pointer']
  onPointerMove: TLEvents<C, S, K, E>['pointer']
  onPointerEnter: TLEvents<C, S, K, E>['pointer']
  onPointerLeave: TLEvents<C, S, K, E>['pointer']
  onDoubleClick: TLEvents<C, S, K, E>['pointer']
  onKeyDown: TLEvents<C, S, K, E>['keyboard']
  onKeyUp: TLEvents<C, S, K, E>['keyboard']
  onPinchStart: TLEvents<C, S, K, E>['pinch']
  onPinch: TLEvents<C, S, K, E>['pinch']
  onPinchEnd: TLEvents<C, S, K, E>['pinch']
}

export interface TLStateMethods<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  E extends TLEventInfo<S> = TLEventInfo<S>
> extends TLEventHandlers<C, S, K, E> {
  onEnter?: (info: { fromId: string } & any) => TLState<C, S, K>
  onExit?: (info: { toId: string } & any) => TLState<C, S, K>
  onTransition?: (info: { toId: string; fromId: string } & any) => TLState<C, S, K>
  onModifierKey?: TLEvents<C, S, K, E>['keyboard']
}

export interface TLStateOptions<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap,
  C extends Record<string, unknown> = Record<string, unknown>
> extends Partial<TLStateMethods<C, S, K>> {
  id: string
  context?: C
  initial?: string
  root?: TLState<any, S, K>
  parent?: TLState<any, S, K>
  children?: TLState<any, S, K>[]
  cursor?: TLCursor
  shortcuts?: TLShortcut<C, S, K>[]
}

// export interface TLState<
//   C extends Record<string, unknown> = Record<string, unknown>,
//   S extends TLShape = TLShape,
//   K extends TLEventMap = TLEventMap
// > extends Partial<TLStateMethods> {
//   id: string
//   context: C
//   isActive: boolean
//   initial?: string
//   currentState?: TLState<any, S, K>
//   children: Map<string, TLState<any, S, K>>
//   events: Required<TLStateMethods<S, K>>
//   disposables: (() => void)[]
//   registerStates(states: TLState<any, S, K>[]): void
//   deregisterStates(states: TLState<any, S, K>[]): void
//   dispose(): void
//   registerKeyboardShortcuts(): void
//   setCurrentState(state: TLState<any, S, K>): void
//   transition(id: string, data?: AnyObject): void
//   isIn(path: string): boolean
//   isInAny(...paths: string[]): boolean
//   forwardEvent<E extends keyof TLStateMethods<S, K>, A extends Parameters<TLStateMethods<S, K>[E]>>(
//     eventName: keyof TLStateMethods<S, K>,
//     ...args: A
//   ): void
// }

export type TLStateFactory<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap
> = (() => TLState<C, S, K>) & { id: string }

export class TLState<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap
> {
  constructor(options = {} as TLStateOptions<S, K, C> & ThisType<TLState<C, S, K>>) {
    const { id, children, shortcuts, ...rest } = options
    this.id = id
    this.shortcuts = shortcuts
    Object.assign(this, rest)

    makeObservable(this, {
      isActive: observable,
      currentState: observable,
      setCurrentState: action,
    })

    if (children) this.registerStates(children)
    if (shortcuts?.length) {
      this.disposables.push(
        ...shortcuts.map(({ keys, fn }) => {
          return KeyUtils.registerShortcut(keys, event => {
            if (!this.isActive) return
            fn(options.root!, this, event)
          })
        })
      )
    }
  }

  id: string

  context: C = {} as C

  isActive = false

  initial?: string

  currentState = {} as TLState<any, S, K>

  root?: TLState<any, S, K>

  children = new Map<string, TLState<any, S, K>>()

  disposables: (() => void)[] = []

  shortcuts?: TLShortcut<C, S, K>[]

  registerStates = (states: TLState<any, S, K>[]): this => {
    states.forEach(state => this.children.set(state.id, state))
    return this
  }

  deregisterStates = (states: TLState<any, S, K>[]): this => {
    states.forEach(state => this.children.delete(state.id))
    return this
  }

  dispose = (): this => {
    this.disposables.forEach(fn => fn())
    return this
  }

  registerKeyboardShortcuts = (): void => {
    if (!this.shortcuts?.length) return

    this.disposables.push(
      ...this.shortcuts.map(({ keys, fn }) => {
        return KeyUtils.registerShortcut(keys, event => {
          if (!this.isActive) return
          fn(this.root, this, event)
        })
      })
    )
  }

  setActive = action((isActive: boolean) => {
    this.isActive = isActive
  })

  setCurrentState = action((state: TLState<any, S, K>): this => {
    this.currentState = state
    return this
  })

  transition = (id: string, data?: AnyObject): this => {
    if (this.children.size === 0)
      throw Error(`Tool ${this.id} has no states, cannot transition to ${id}.`)
    const nextState = this.children.get(id)
    const prevState = this.currentState
    if (!nextState) throw Error(`Could not find a state named ${id}.`)
    if (prevState.isActive) {
      prevState.events.onExit({ ...data, toId: id })
      prevState.dispose()
      nextState.registerKeyboardShortcuts()
      this.setCurrentState(nextState)
      this.events.onTransition({ ...data, fromId: prevState.id, toId: id })
      nextState.events.onEnter({ ...data, fromId: prevState.id })
    } else {
      this.currentState = nextState
      nextState.registerKeyboardShortcuts()
      nextState.events.onEnter({ ...data, fromId: '' })
    }
    return this
  }

  isIn = (path: string): boolean => {
    const ids = path.split('.').reverse()
    let state = this as TLState<any, S, K>
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

  isInAny = (...paths: string[]): boolean => {
    return paths.some(this.isIn)
  }

  forwardEvent = (eventName: keyof TLStateMethods<C, S, K>, ...args: any[]): this => {
    if (this.currentState?.events?.[eventName]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.currentState.events?.[eventName](...args)
    }
    return this
  }

  events: Required<TLStateMethods<C, S, K>> = {
    onEnter: info => {
      console.log('entering', this.id)
      this.setActive(true)
      const initialState = this.initial && this.children.get(this.initial)
      if (initialState) {
        this.currentState = initialState
        initialState.registerKeyboardShortcuts()
        initialState.events.onEnter({ fromId: '' })
      }
      this.onEnter?.(info)
      return this
    },
    onExit: info => {
      this.setActive(false)
      this.currentState.events?.onExit({ toId: 'parent' })
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

  onEnter?: (info: { fromId: string } & any) => TLState<C, S, K>
  onExit?: (info: { toId: string } & any) => TLState<C, S, K>
  onTransition?: (info: { toId: string; fromId: string } & any) => TLState<C, S, K>
  onModifierKey?: TLEvents<C, S, K>['keyboard']
  onWheel?: TLEvents<C, S, K>['wheel']
  onPointerDown?: TLEvents<C, S, K>['pointer']
  onPointerUp?: TLEvents<C, S, K>['pointer']
  onPointerMove?: TLEvents<C, S, K>['pointer']
  onPointerEnter?: TLEvents<C, S, K>['pointer']
  onPointerLeave?: TLEvents<C, S, K>['pointer']
  onDoubleClick?: TLEvents<C, S, K>['pointer']
  onKeyDown?: TLEvents<C, S, K>['keyboard']
  onKeyUp?: TLEvents<C, S, K>['keyboard']
  onPinchStart?: TLEvents<C, S, K>['pinch']
  onPinch?: TLEvents<C, S, K>['pinch']
  onPinchEnd?: TLEvents<C, S, K>['pinch']
}

export function createState<
  C extends Record<string, unknown> = Record<string, unknown>,
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap
>(options = {} as TLStateOptions<S, K, C> & ThisType<TLState<C, S, K>>): TLState<C, S, K> {
  return new TLState<C, S, K>(options)

  // this.isActive = false
  // this.children = new Map()
  // this.currentState = undefined
  // this.context = {} as C
  // this.disposables = []
  // const setActive = action((isActive: boolean) => {
  //   this.isActive = isActive
  // })
  // this.setCurrentState = state => {
  //   this.currentState = state
  // }
  // this.registerStates = states => {
  //   states.forEach(state => this.children.set(state.id, state))
  // }
  // this.deregisterStates = states => {
  //   states.forEach(state => this.children.delete(state.id))
  // }
  // this.registerKeyboardShortcuts = () => {
  //   // todo
  // }
  // this.dispose = () => {
  //   // todo
  // }
  // this.forwardEvent = (eventName, ...args) => {
  //   if (this.currentState?.events?.[eventName]) {
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //     // @ts-ignore
  //     this.currentState.events?.[eventName](...args)
  //   }
  // }
  // this.transition = (id, data) => {
  //   if (this.children.size === 0)
  //     throw Error(`Tool ${this.id} has no states, cannot transition to ${id}.`)
  //   const nextState = this.children.get(id)
  //   const prevState = this.currentState
  //   if (!nextState) throw Error(`Could not find a state named ${id}.`)
  //   if (prevState) {
  //     prevState.events.onExit({ ...data, toId: id })
  //     prevState.dispose()
  //     nextState.registerKeyboardShortcuts()
  //     this.setCurrentState(nextState)
  //     this.events.onTransition({ ...data, fromId: prevState.id, toId: id })
  //     nextState.events.onEnter({ ...data, fromId: prevState.id })
  //   } else {
  //     this.currentState = nextState
  //     nextState.events.onEnter({ ...data, fromId: '' })
  //   }
  // }
  // this.isIn = path => {
  //   const ids = path.split('.').reverse()
  //   let state = this as TLState
  //   while (ids.length > 0) {
  //     const id = ids.pop()
  //     if (!id) return true
  //     if (state.currentState?.id === id) {
  //       if (ids.length === 0) return true
  //       state = state.currentState
  //       continue
  //     } else return false
  //   }
  //   return false
  // }
  // this.isInAny = (...paths) => {
  //   return paths.some(this.isIn)
  // }
  // this.events = {
  //   onEnter: info => {
  //     setActive(true)
  //     if (this.initial) this.transition(this.initial, info)
  //     this.onEnter?.(info)
  //     return this
  //   },
  //   onExit: info => {
  //     this.isActive = false
  //     this.currentState?.onExit?.({ toId: 'parent' })
  //     this.onExit?.(info)
  //     return this
  //   },
  //   onTransition: info => {
  //     this.onTransition?.(info)
  //     return this
  //   },
  //   onWheel: (info, event) => {
  //     this.onWheel?.(info, event)
  //     this.forwardEvent('onWheel', info, event)
  //     return this
  //   },
  //   onPointerDown: (info, event) => {
  //     this.onPointerDown?.(info, event)
  //     this.forwardEvent('onPointerDown', info, event)
  //     return this
  //   },
  //   onPointerUp: (info, event) => {
  //     this.onPointerUp?.(info, event)
  //     this.forwardEvent('onPointerUp', info, event)
  //     return this
  //   },
  //   onPointerMove: (info, event) => {
  //     this.onPointerMove?.(info, event)
  //     this.forwardEvent('onPointerMove', info, event)
  //     return this
  //   },
  //   onPointerEnter: (info, event) => {
  //     this.onPointerEnter?.(info, event)
  //     this.forwardEvent('onPointerEnter', info, event)
  //     return this
  //   },
  //   onPointerLeave: (info, event) => {
  //     this.onPointerLeave?.(info, event)
  //     this.forwardEvent('onPointerLeave', info, event)
  //     return this
  //   },
  //   onDoubleClick: (info, event) => {
  //     this.onDoubleClick?.(info, event)
  //     this.forwardEvent('onDoubleClick', info, event)
  //     return this
  //   },
  //   onKeyDown: (info, event) => {
  //     this.events.onModifierKey(info, event)
  //     this.onKeyDown?.(info, event)
  //     this.forwardEvent('onKeyDown', info, event)
  //     return this
  //   },
  //   onKeyUp: (info, event) => {
  //     this.events.onModifierKey(info, event)
  //     this.onKeyUp?.(info, event)
  //     this.forwardEvent('onKeyUp', info, event)
  //     return this
  //   },
  //   onPinchStart: (info, event) => {
  //     this.onPinchStart?.(info, event)
  //     this.forwardEvent('onPinchStart', info, event)
  //     return this
  //   },
  //   onPinch: (info, event) => {
  //     this.onPinch?.(info, event)
  //     this.forwardEvent('onPinch', info, event)
  //     return this
  //   },
  //   onPinchEnd: (info, event) => {
  //     this.onPinchEnd?.(info, event)
  //     this.forwardEvent('onPinchEnd', info, event)
  //     return this
  //   },
  //   onModifierKey: (info, event) => {
  //     switch (event.key) {
  //       case 'Shift':
  //       case 'Alt':
  //       case 'Ctrl':
  //       case 'Meta': {
  //         this.events.onPointerMove(info, event)
  //         break
  //       }
  //     }
  //     return this
  //   },
  // }
  // Object.assign(this, rest)
  // if (children) this.registerStates(children)
  // if (this.initial) this.transition(this.initial)

  // if (shortcuts?.length) {
  //   this.disposables.push(
  //     ...shortcuts.map(({ keys, fn }) => {
  //       return KeyUtils.registerShortcut(keys, event => {
  //         if (!this.isActive) return
  //         fn(options.root!, this, event)
  //       })
  //     })
  //   )
  // }

  // makeObservable(this, {
  //   isActive: observable,
  //   currentState: observable,
  //   setCurrentState: action,
  // })

  // return this
}
