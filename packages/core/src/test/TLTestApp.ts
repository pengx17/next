/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLEventInfo, TLTargetType } from '~types'
import {
  TLApp,
  TLUserState,
  TLBoxShape,
  TLDotShape,
  TLDrawShape,
  TLEllipseShape,
  TLLineShape,
  TLPolygonShape,
  TLPolylineShape,
  TLStarShape,
  TLBoxTool,
  TLDotTool,
  TLDrawTool,
  TLEraseTool,
  TLLineTool,
  TLSelectTool,
  TLAppConstructorParams,
  TLTextShape,
  TLTextTool,
} from '~lib'
import { action, makeObservable } from 'mobx'

export class SelectTool extends TLSelectTool {
  static type = 'select'
  static shortcut = ['v']
}

export class BoxTool extends TLBoxTool<TLBoxShape, any> {
  static type = 'box'
  static shortcut = ['r']
  Shape = TLBoxShape
}

export class DotTool extends TLDotTool<TLDotShape, any> {
  static type = 'dot'
  static shortcut = ['d']
  Shape = TLDotShape
}

export class DrawTool extends TLDrawTool<TLDrawShape, any> {
  static type = 'draw'
  static shortcut = ['d']
  Shape = TLDrawShape
}

export class EraseTool extends TLEraseTool<any, any> {
  static type = 'erase'
  static shortcut = ['e']
}

export class LineTool extends TLLineTool<TLLineShape, any> {
  static type = 'line'
  static shortcut = ['l']
  Shape = TLLineShape
}

export class TextTool extends TLTextTool<TLTextShape, any> {
  static type = 'text'
  static shortcut = ['t']
  Shape = TLTextShape
}

interface KeyboardOptions {
  shiftKey?: boolean
  altKey?: boolean
  ctrlKey?: boolean
}

interface PointerOptions {
  id?: number
  shiftKey?: boolean
  altKey?: boolean
  ctrlKey?: boolean
}

type S =
  | TLBoxShape
  | TLDrawShape
  | TLDotShape
  | TLEllipseShape
  | TLLineShape
  | TLPolylineShape
  | TLPolygonShape
  | TLStarShape

const CANVAS_INFO_TYPE: TLEventInfo<S> = { type: TLTargetType.Canvas }

export class TLTestApp extends TLApp<S> {
  constructor(params = {} as Partial<TLAppConstructorParams<S>>) {
    super({
      document: {
        shapes: [
          {
            id: 'box1',
            type: 'box',
            point: [0, 0],
            size: [100, 100],
          },
          {
            id: 'box2',
            type: 'box',
            point: [250, 250],
            size: [100, 100],
          },
          {
            id: 'box3',
            type: 'box',
            point: [300, 300], // Overlapping box2
            size: [100, 100],
          },
        ],
      },
      shapes: [
        TLBoxShape,
        TLDrawShape,
        TLDotShape,
        TLEllipseShape,
        TLLineShape,
        TLPolylineShape,
        TLPolygonShape,
        TLStarShape,
        TLTextShape,
      ],
      tools: [BoxTool, EraseTool, LineTool, DotTool, DrawTool, TextTool],
      ...params,
    })

    this.onResize({
      minX: 0,
      minY: 0,
      maxX: 1080,
      maxY: 720,
      width: 1080,
      height: 720,
    })

    makeObservable(this)
  }

  prevScreenPoint = [0, 0]

  // Inputs

  pointerMove = (
    point: number[],
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this._events.onPointerMove?.(this.getInfo(info), this.getPointerEvent(point, options))
    return this
  }

  pointerDown = (
    point: number[] = this.prevScreenPoint,
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this._events.onPointerDown?.(this.getInfo(info), this.getPointerEvent(point, options))
    return this
  }

  pointerUp = (
    point: number[] = this.prevScreenPoint,
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this._events.onPointerUp?.(this.getInfo(info), this.getPointerEvent(point, options))
    return this
  }

  click = (
    point: number[] = this.prevScreenPoint,
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this.pointerDown(point, info, options)
    this.pointerUp(point, info, options)
    return this
  }

  doubleClick = (
    point: number[] = this.prevScreenPoint,
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this.click(point, info, options)
    this.click(point, info, options)
    this._events.onDoubleClick?.(this.getInfo(info), this.getPointerEvent(point, options))
    return this
  }

  pointerEnter = (
    point: number[] = this.prevScreenPoint,
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this._events.onPointerEnter?.(this.getInfo(info), this.getPointerEvent(point, options))
    return this
  }

  pointerLeave = (
    point: number[] = this.prevScreenPoint,
    info: string | TLEventInfo<S> = CANVAS_INFO_TYPE,
    options?: PointerOptions
  ) => {
    this.prevScreenPoint = point
    this._events.onPointerLeave?.(this.getInfo(info), this.getPointerEvent(point, options))
    return this
  }

  keyDown = (key: string, info: TLEventInfo<S> = CANVAS_INFO_TYPE, options?: KeyboardOptions) => {
    this._events.onKeyDown?.(info, this.getKeyboardEvent(key, options))
    return this
  }

  keyUp = (key: string, info: TLEventInfo<S> = CANVAS_INFO_TYPE, options?: KeyboardOptions) => {
    this._events.onKeyUp?.(info, this.getKeyboardEvent(key, options))
    return this
  }

  wheel = (delta: number[], point: number[], options?: KeyboardOptions) => {
    this._events.onWheel?.(
      { type: TLTargetType.Canvas, point, delta },
      this.getWheelEvent(point, options)
    )
    return this
  }

  // Events

  getInfo = (info: string | TLEventInfo<S>): TLEventInfo<S> => {
    return typeof info === 'string'
      ? { type: TLTargetType.Shape, shape: this.getShape(info), order: 0 }
      : info
  }

  getKeyboardEvent(key: string, options = {} as KeyboardOptions): KeyboardEvent {
    const { shiftKey = false, altKey = false, ctrlKey = false } = options

    return {
      shiftKey,
      altKey,
      ctrlKey,
      key,
    } as KeyboardEvent
  }

  getPointerEvent = (point: number[], options = {} as PointerOptions): PointerEvent => {
    const { id = 1, shiftKey = false, altKey = false, ctrlKey = false } = options

    return {
      shiftKey,
      altKey,
      ctrlKey,
      pointerId: id,
      clientX: point[0],
      clientY: point[1],
    } as PointerEvent
  }

  getWheelEvent = (point: number[], options = {} as PointerOptions): WheelEvent => {
    const { shiftKey = false, altKey = false, ctrlKey = false } = options

    return {
      shiftKey,
      altKey,
      ctrlKey,
      clientX: point[0],
      clientY: point[1],
    } as WheelEvent
  }

  getShapesById(ids: string[]) {
    return ids.map(id => this.getShape(id))
  }

  // Tests

  expectHoveredIdToBe = (b: string) => {
    expect(this.userState.hoveredId).toBe(b)
    return this
  }

  expectEditingIdToBe = (b: string) => {
    expect(this.userState.editingId).toBe(b)
    return this
  }

  expectSelectedIdsToBe = (b: string[]) => {
    expect(new Set(this.selectedIds)).toEqual(new Set(b))
    return this
  }

  expectSelectedShapesToBe = (b: string[] | S[]) => {
    if (b[0] && typeof b[0] === 'string') b = b.map(id => this.getShape(id as string))
    expect(new Set(this.selectedShapes)).toEqual(new Set(b as S[]))
    return this
  }

  expectShapesToBeDefined = (ids: string[]) => {
    ids.forEach(id => expect(this.getShape(id)).toBeDefined())
    return this
  }

  expectShapesToBeUndefined = (ids: string[]) => {
    ids.forEach(id => expect(this.getShape(id)).toBeUndefined())
    return this
  }

  expectShapesToBeAtPoints = (shapes: Record<string, number[]>) => {
    Object.entries(shapes).forEach(([id, point]) => {
      expect(this.getShape(id)?.model.point).toEqual(point)
    })
    return this
  }

  expectShapesToHaveProps = <T extends S>(shapes: Record<string, Partial<T['model']>>) => {
    Object.entries(shapes).forEach(([id, model]) => {
      const shape = this.getShape<T>(id)
      if (!shape) throw Error('That shape does not exist.')
      Object.entries(model).forEach(([key, value]) => {
        expect(shape.model[key]).toEqual(value)
      })
    })
    return this
  }

  expectShapesInOrder = (...ids: string[]) => {
    ids.forEach((id, i) => expect(this.document.shapes.indexOf(this.getShape(id).model)).toBe(i))
    return this
  }

  expectToBeIn = (path: string) => {
    expect(this.isIn(path)).toBe(true)
    return this
  }

  expectUserStateToBe = (partial: Partial<TLUserState>) => {
    for (const key in partial) {
      expect(this.userState[key as keyof TLUserState]).toEqual(partial[key as keyof TLUserState])
    }
    return this
  }

  @action reset = () => {
    this.loadDocument({
      shapes: [],
    })
    return this
  }
}
