/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  TLApp,
  TLBoxShape,
  TLDocumentModel,
  TLDotShape,
  TLDrawShape,
  TLEllipseShape,
  TLLineShape,
  TLPolygonShape,
  TLPolylineShape,
  TLShapeConstructor,
  TLStarShape,
} from '~lib'
import { BoxTool } from '~lib/tools/TLBoxTool/TLBoxTool.test'
import { DotTool } from '~lib/tools/TLDotTool/TLDotTool.test'
import { DrawTool } from '~lib/tools/TLDrawTool/TLDrawTool.test'
import { EraseTool } from '~lib/tools/TLEraseTool/TLEraseTool.test'
import { LineTool } from '~lib/tools/TLLineTool/TLLineTool.test'
import { TLEventInfo, TLEventMap, TLTargetType } from '~types'
import { TLTestEditableBox } from './TLTestEditableBox'

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
  | TLTestEditableBox
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
  constructor(serializedApp: TLDocumentModel = defaultModel) {
    super(
      serializedApp,
      [
        TLTestEditableBox,
        TLBoxShape,
        TLDrawShape,
        TLDotShape,
        TLEllipseShape,
        TLLineShape,
        TLPolylineShape,
        TLPolygonShape,
        TLStarShape,
      ],
      [BoxTool, EraseTool, LineTool, DotTool, DrawTool]
    )
    this.viewport.updateBounds({
      minX: 0,
      minY: 0,
      maxX: 1080,
      maxY: 720,
      width: 1080,
      height: 720,
    })
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
      ? { type: TLTargetType.Shape, shape: this.getShapeById(info), order: 0 }
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
    return ids.map(id => this.getShapeById(id))
  }

  // Tests

  expectSelectedIdsToBe = (b: string[]) => {
    expect(new Set(this.selectedIds)).toEqual(new Set(b))
    return this
  }

  expectSelectedShapesToBe = (b: string[] | S[]) => {
    if (b[0] && typeof b[0] === 'string') b = b.map(id => this.getShapeById(id as string))
    expect(new Set(this.selectedShapes)).toEqual(new Set(b as S[]))
    return this
  }

  expectShapesToBeDefined = (ids: string[], pageId?: string) => {
    ids.forEach(id => expect(this.getShapeById(id, pageId)).toBeDefined())
    return this
  }

  expectShapesToBeUndefined = (ids: string[], pageId?: string) => {
    const page = this.getPageById(pageId ?? this.currentPage.id)!
    ids.forEach(id => expect(page.shapes.find(s => s.id === id)).toBeUndefined())
    return this
  }

  expectShapesToBeAtPoints = (shapes: Record<string, number[]>, pageId?: string) => {
    Object.entries(shapes).forEach(([id, point]) => {
      expect(this.getShapeById(id, pageId)?.props.point).toEqual(point)
    })
    return this
  }

  expectShapesToHaveProps = <T extends S>(
    shapes: Record<string, Partial<T['props']>>,
    pageId?: string
  ) => {
    Object.entries(shapes).forEach(([id, props]) => {
      const shape = this.getShapeById<T>(id, pageId)
      if (!shape) throw Error('That shape does not exist.')
      Object.entries(props).forEach(([key, value]) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(shape.props[key]).toEqual(value)
      })
    })
    return this
  }

  expectShapesInOrder = (...ids: string[]) => {
    ids.forEach((id, i) => expect(this.shapes.indexOf(this.getShapeById(id))).toBe(i))
    return this
  }
}

const defaultModel: TLDocumentModel = {
  currentPageId: 'page1',
  selectedIds: [],
  pages: [
    {
      name: 'Page',
      id: 'page1',
      shapes: [
        {
          id: 'box1',
          type: 'box',
          parentId: 'page1',
          point: [0, 0],
        },
        {
          id: 'box2',
          type: 'box',
          parentId: 'page1',
          point: [250, 250],
        },
        {
          id: 'box3',
          type: 'editable-box',
          parentId: 'page1',
          point: [300, 300], // Overlapping box2
        },
      ],
      bindings: [],
    },
  ],
}
