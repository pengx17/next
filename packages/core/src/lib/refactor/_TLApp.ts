/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { action, computed, makeObservable, observable, reaction, toJS, transaction } from 'mobx'
import { TLBounds, TLCursor, TLEventMap, TLEvents, TLShortcut, TLStateEvents } from './_types'
import type { TLShape, TLShapeConstructor } from './_shapes'
import type { TLToolConstructor } from './_TLTool'
import {
  TLHistoryManager,
  TLEventManager,
  TLDisplayManager,
  TLInputManager,
  TLCursorManager,
} from './managers'
import { TLRootState } from './_TLState'
import { TLViewportManager } from './_TLViewportManager'
import { TLSelectTool } from './_tools'
import { BoundsUtils, KeyUtils, uniqueId } from '~utils'
import { TLResizeCorner } from '~types'
import * as fsp from 'fast-json-patch'

/* -------------------------------------------------- */
/*                        TLApp                       */
/* -------------------------------------------------- */

export type TLPatch = fsp.Operation[]

export interface TLAssetModel {
  id: string
  type: any
  src: string
}

export interface TLUserState {
  camera: number[]
  bounds: TLBounds
  selectionRotation: number
  isToolLocked: boolean
  editingId?: string
  hoveredId?: string
  brush?: TLBounds
  shiftKey: boolean
  ctrlKey: boolean
  altKey: boolean
  spaceKey: boolean
  isPinching: boolean
  currentScreenPoint: number[]
  currentPoint: number[]
  previousScreenPoint: number[]
  previousPoint: number[]
  originScreenPoint: number[]
  originPoint: number[]
}

export interface TLDisplayState<S extends TLShape = TLShape> {
  cursor: TLCursor
  cursorRotation: number
  shapesInViewport: S[]
  selectionDirectionHint?: number[]
  showSelection: boolean
  showSelectionDetail: boolean
  showContextBar: boolean
  showRotateHandles: boolean
  showResizeHandles: boolean
}

export interface TLUserSettings {
  mode: 'light' | 'dark'
  showGrid: boolean
}

export interface TLDocumentModel<S extends TLShape = TLShape> {
  shapes: S['model'][]
  selectedIds: string[]
}

export interface TLAppConstructorParams<S extends TLShape = TLShape> {
  id: string
  document: TLDocumentModel<S>
  shapes: TLShapeConstructor<S>[]
  tools: TLToolConstructor<S>[]
  userState: TLUserState
  settings: TLUserSettings
  debug: boolean
}

/* -------------------------------------------------- */
/*                         App                        */
/* -------------------------------------------------- */

export class TLApp<
  S extends TLShape = TLShape,
  K extends TLEventMap = TLEventMap
> extends TLRootState<S, K> {
  constructor(params = {} as Partial<TLAppConstructorParams<S>>) {
    super()
    const { document, userState, settings, debug = false, shapes = [] } = params
    makeObservable(this)
    this.debug = debug
    this.inputs = new TLInputManager(this)
    this.viewport = new TLViewportManager(this)
    this.cursors = new TLCursorManager(this)
    this.history = new TLHistoryManager(this)
    this.display = new TLDisplayManager(this)
    this.events = new TLEventManager(this)
    const ownShortcuts: TLShortcut<S, K>[] = [
      {
        keys: 'mod+shift+g',
        fn: () => this.toggleGrid(),
      },
      {
        keys: 'shift+0',
        fn: () => this.resetZoom(),
      },
      {
        keys: 'mod+-',
        fn: () => this.zoomToSelection(),
      },
      {
        keys: 'mod+-',
        fn: () => this.zoomOut(),
      },
      {
        keys: 'mod+=',
        fn: () => this.zoomIn(),
      },
      {
        keys: 'mod+z',
        fn: () => this.undo(),
      },
      {
        keys: 'mod+shift+z',
        fn: () => this.redo(),
      },
      {
        keys: '[',
        fn: () => this.sendBackward(),
      },
      {
        keys: 'shift+[',
        fn: () => this.sendToBack(),
      },
      {
        keys: ']',
        fn: () => this.bringForward(),
      },
      {
        keys: 'shift+]',
        fn: () => this.bringToFront(),
      },
      {
        keys: 'mod+a',
        fn: () => {
          const { selectedTool } = this
          if (selectedTool.currentState.id !== 'idle') return
          if (selectedTool.id !== 'select') {
            this.selectTool('select')
          }
          this.selectAll()
        },
      },
      {
        keys: 'mod+s',
        fn: () => {
          this.save()
        },
      },
      {
        keys: 'mod+shift+s',
        fn: () => {
          this.saveAs()
        },
      },
    ]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const shortcuts = (this.constructor['shortcuts'] || []) as TLShortcut<S, K>[]
    this._disposables.push(
      ...[...ownShortcuts, ...shortcuts].map(({ keys, fn }) => {
        return KeyUtils.registerShortcut(keys, e => {
          fn(this, this, e)
        })
      })
    )
    if (this.states && this.states.length > 0) {
      this.registerStates(this.states)
      const initialId = this.initial ?? this.states[0].id
      const state = this.children.get(initialId)
      if (state) {
        this.currentState = state
        this.currentState?._events.onEnter({ fromId: 'initial' })
      }
    }
    this.shapes.clear()
    if (shapes) this.registerShapes(shapes)
    if (userState) this.updateUserState(userState)
    if (settings) this.updateUserSettings(settings)
    if (document) this.loadDocument(document)
    this.history.start()
  }

  static id = 'app'

  static states: TLToolConstructor<any, any>[] = [TLSelectTool]

  static initial = 'select'

  debug: boolean

  @observable document: TLDocumentModel<S> = {
    shapes: [],
    selectedIds: [],
  }

  @observable userState: TLUserState = {
    camera: [0, 0, 1],
    bounds: {
      minX: 0,
      minY: 0,
      maxX: 1080,
      maxY: 720,
      width: 1080,
      height: 720,
    },
    selectionRotation: 0,
    isToolLocked: false,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    spaceKey: false,
    isPinching: false,
    currentScreenPoint: [0, 0],
    currentPoint: [0, 0],
    previousScreenPoint: [0, 0],
    previousPoint: [0, 0],
    originScreenPoint: [0, 0],
    originPoint: [0, 0],
  }

  @observable displayState: TLDisplayState<S> = {
    cursor: TLCursor.Default,
    cursorRotation: 0,
    shapesInViewport: [],
    selectionDirectionHint: undefined,
    showSelection: false,
    showSelectionDetail: false,
    showContextBar: false,
    showRotateHandles: false,
    showResizeHandles: false,
  }

  @observable userSettings: TLUserSettings = {
    mode: 'light',
    showGrid: false,
  }

  @observable shapes = new Map<string, S>()

  /** A manager for user inputs, e.g. keys and pointers */
  inputs: TLInputManager<S, K>

  /** A manager for the viewport and actions like pan and zoom */
  viewport: TLViewportManager<S, K>

  /** A manager for the user's cursor */
  cursors: TLCursorManager<S, K>

  /** A manager for history, i.e. undo and redo */
  history: TLHistoryManager<S, K>

  /** A manager for the display state, e.g. showing selection bounds */
  display: TLDisplayManager<S, K>

  /** A manager for the events and subscriptions */
  events: TLEventManager<S, K, this>

  /* ------------------- Tool States ------------------ */

  @computed get selectedTool() {
    return this.currentState
  }

  selectTool = this.transition

  registerTools = this.registerStates

  /* -------------------- Document -------------------- */

  /** Load a document model. */
  @action loadDocument(model: TLDocumentModel<S>) {
    transaction(() => {
      this.document.shapes = []
      this.document.selectedIds = []
      this.addShapes(model.shapes)
      this.setSelectedShapes(model.selectedIds)
    })
    if (this.history.state === 'playing') this.history.reset()
    return this
  }

  /** Apply a JSON patch to the current document */
  @action patchDocument(patch: TLPatch) {
    fsp.applyPatch(this.document, patch)
  }

  /* -------------------- States -------------------- */

  /** Apply a change to the user state. */
  @action updateUserState(userState: Partial<TLUserState>) {
    Object.assign(this.userState, userState)
    return this
  }

  /** Apply a change to the user state. */
  @action updateDisplayState(displayState: Partial<TLDisplayState>) {
    Object.assign(this.displayState, displayState)
    return this
  }

  /** Apply a change to the user settings. */
  @action updateUserSettings(userSettings: Partial<TLUserSettings>) {
    Object.assign(this.userSettings, userSettings)
    return this
  }

  /** The part of the document currently in view */
  @computed get currentView(): TLBounds {
    const {
      userState: { bounds, camera },
    } = this
    const [cx, cy, cz] = camera
    const w = bounds.width / cz
    const h = bounds.height / cz
    return {
      minX: -cx,
      minY: -cy,
      maxX: w - cx,
      maxY: h - cy,
      width: w,
      height: h,
    }
  }

  /* --------------- Shape Constructors --------------- */

  /** A map of registered shape constructors */
  private registeredShapes = new Map<string, TLShapeConstructor<S>>()

  /** Register a shape constructor. */
  @action registerShapes(shapeCtors: TLShapeConstructor<S>[]) {
    shapeCtors.forEach(shapeCtor => this.registeredShapes.set(shapeCtor.type, shapeCtor))
    return this
  }

  getShapeConstructor = (shape: S | S['model']): TLShapeConstructor<S> => {
    const model = 'getBounds' in shape ? (shape as S).model : (shape as S['model'])
    const ShapeCtor = this.registeredShapes.get(model.type)
    if (!ShapeCtor) throw new Error(`Shape type "${model.type}" is not registered.`)
    return ShapeCtor
  }

  /* --------------------- Shapes --------------------- */

  private parseModelsFromShapeArg = (shapesArg: S[] | S['model'][]): S['model'][] => {
    return 'getBounds' in shapesArg[0]
      ? (shapesArg as S[]).map(s => s.model)
      : (shapesArg as S['model'][])
  }

  private parseShapesFromShapeArg<S>(shapesArg: S[] | string[]) {
    if (typeof shapesArg[0] === 'string') {
      return (shapesArg as string[]).map(id => this.getShape(id))
    } else {
      return shapesArg as S[]
    }
  }

  /** Create shapes based on partial models, requiring only the shape's type. */
  createShapes = (partials: (Partial<S['model']> & { type: S['model']['type'] })[]) => {
    return this.addShapes(
      partials.map(partial => {
        const shapeCtor = this.registeredShapes.get(partial.type)
        if (!shapeCtor) throw new Error(`No shape registered for type ${partial.type}`)
        const id = partial.id ?? uniqueId()
        return { ...shapeCtor.defaultModel, ...partial, id }
      })
    )
  }

  /** Add shapes to the document model. */
  @action addShapes(shapeModels: S[] | S['model'][], index = this.document.shapes.length) {
    const models = this.parseModelsFromShapeArg(shapeModels)
    this.document.shapes.splice(index, 0, ...models)
    models.forEach(model => {
      const ShapeCtor = this.getShapeConstructor(model)
      this.shapes.set(model.id, new ShapeCtor(this, model.id))
    })
    return this
  }

  /** Update shapes in the document model. */
  @action updateShapes(shapeModels: S[] | S['model'][]) {
    const models = this.parseModelsFromShapeArg(shapeModels)
    models.forEach(model => {
      const shape = this.shapes.get(model.id)
      if (shape) shape.update(model)
    })
    return this
  }

  /** Delete shapes from the document model. */
  @action deleteShapes(shapeModels: S[] | S['model'][]) {
    const { shapes, document } = this
    const models = this.parseModelsFromShapeArg(shapeModels)
    models.forEach(model => {
      shapes.delete(model.id)
      document.shapes.splice(document.shapes.indexOf(model), 1)
    })
    return this
  }

  /** Get the model for a shape by its Id. */
  getShapeModel = (id: string): S['model'] => {
    return this.getShape(id).model
  }

  /** Get a shape by its Id. */
  getShape = <T extends S>(id: string): T => {
    const shape = this.shapes.get(id) as T
    if (!shape) throw new Error(`Shape "${id}" not found.`)
    return shape
  }

  /* ----------------- Selected Shapes ---------------- */

  /** An array of selected shape Ids. */
  @computed get selectedIds() {
    return this.document.selectedIds
  }

  /** An array of selected shapes. */
  @observable selectedShapesArray: S[] = []

  /** A set of selected shapes. */
  @observable selectedShapes = new Set<S>()

  /** The bounding box of the currently selected shapes, if any. */
  @computed get selectionBounds(): TLBounds | undefined {
    const { selectedShapesArray } = this
    if (selectedShapesArray.length === 0) return undefined
    if (selectedShapesArray.length === 1) {
      return { ...selectedShapesArray[0].bounds, rotation: selectedShapesArray[0].model.rotation }
    }
    return BoundsUtils.getCommonBounds(selectedShapesArray.map(shape => shape.rotatedBounds))
  }

  /** Set the user's selected shapes. */
  @action setSelectedShapes(shapes: string[] | S[]) {
    let shapesArray: S[]
    let ids: string[]
    if (typeof shapes[0] === 'string') {
      ids = shapes as string[]
      shapesArray = ids.map(id => this.getShape(id))
    } else {
      shapesArray = shapes as S[]
      ids = shapesArray.map(shape => shape.id)
    }
    transaction(() => {
      // Set selected ids
      this.document.selectedIds = ids
      // Set selected shapes array
      this.selectedShapesArray = shapesArray
      // Set selection rotation
      this.userState.selectionRotation =
        shapesArray.length === 1 ? shapesArray[0].model.rotation ?? 0 : 0
      // Set selected shapes (set)
      this.selectedShapes.clear()
      shapesArray.forEach(shape => this.selectedShapes.add(shape))
    })
    return this
  }

  /** Select no shapes. */
  clearSelectedShapes = (): this => {
    return this.setSelectedShapes([])
  }

  /* ------------------ Hovered Shape ----------------- */

  /** The user's current hovered shape id. */
  @computed get hoveredId() {
    return this.userState.hoveredId
  }

  /** The user's current hovered shape. */
  @computed get HoveredShape(): S | undefined {
    const {
      userState: { hoveredId },
    } = this
    return hoveredId ? this.shapes.get(hoveredId) : undefined
  }

  /** Set the user's hovered shape. */
  @action setHoveredShape = (shape?: string | S): this => {
    this.userState.hoveredId = typeof shape === 'string' ? shape : shape?.id
    return this
  }

  /** Clear the user's hovered shape. */
  clearHoveredShape = (): this => {
    return this.setHoveredShape()
  }

  /* ------------------ Editing Shape ----------------- */

  /** The user's current editing shape id. */
  @computed get editingId() {
    return this.userState.editingId
  }

  /** The currently editing shape, if any. */
  @computed get editingShape(): S | undefined {
    const {
      userState: { editingId },
    } = this
    return editingId ? this.shapes.get(editingId) : undefined
  }

  /** Set the user's editing shape. */
  @action setEditingShape = (shape?: string | S): this => {
    this.userState.editingId = typeof shape === 'string' ? shape : shape?.id
    return this
  }

  /** Clear the user's editing shape. */
  clearEditingShape = (): this => {
    return this.setEditingShape()
  }

  /* ----------------- Event Handlers ----------------- */

  onTransition: TLStateEvents<S, K>['onTransition'] = () => {
    this.updateUserState({ isToolLocked: false })
  }

  onWheel: TLEvents<S, K>['wheel'] = (info, e) => {
    this.viewport.panCamera(info.delta)
    this.inputs.onWheel([...this.viewport.getPagePoint([e.clientX, e.clientY]), 0.5], e)
  }

  onPointerDown: TLEvents<S, K>['pointer'] = (info, e) => {
    if ('clientX' in e) {
      this.inputs.onPointerDown(
        [...this.viewport.getPagePoint([e.clientX, e.clientY]), 0.5],
        e as K['pointer']
      )
    }
  }

  onPointerUp: TLEvents<S, K>['pointer'] = (info, e) => {
    if ('clientX' in e) {
      this.inputs.onPointerUp(
        [...this.viewport.getPagePoint([e.clientX, e.clientY]), 0.5],
        e as K['pointer']
      )
    }
  }

  onPointerMove: TLEvents<S, K>['pointer'] = (info, e) => {
    if ('clientX' in e) {
      this.inputs.onPointerMove([...this.viewport.getPagePoint([e.clientX, e.clientY]), 0.5], e)
    }
  }

  onKeyDown: TLEvents<S, K>['keyboard'] = (info, e) => {
    this.inputs.onKeyDown(e)
  }

  onKeyUp: TLEvents<S, K>['keyboard'] = (info, e) => {
    this.inputs.onKeyUp(e)
  }

  onPinchStart: TLEvents<S, K>['pinch'] = (info, e) => {
    this.inputs.onPinchStart([...this.viewport.getPagePoint(info.point), 0.5], e)
  }

  onPinch: TLEvents<S, K>['pinch'] = (info, e) => {
    this.inputs.onPinch([...this.viewport.getPagePoint(info.point), 0.5], e)
  }

  onPinchEnd: TLEvents<S, K>['pinch'] = (info, e) => {
    this.inputs.onPinchEnd([...this.viewport.getPagePoint(info.point), 0.5], e)
  }

  /* ----------------------- API ---------------------- */

  /** Bring shapes forward in the shape stack. */
  @action bringForward = (shapes?: S[] | string[]): this => {
    const { document } = this
    const modelsToMove = this.parseShapesFromShapeArg(shapes ?? this.selectedShapesArray).map(
      shape => shape.model
    )
    modelsToMove
      .sort((a, b) => document.shapes.indexOf(b) - document.shapes.indexOf(a))
      .map(model => document.shapes.indexOf(model))
      .forEach(index => {
        if (index === document.shapes.length - 1) return
        const next = document.shapes[index + 1]
        if (modelsToMove.includes(next)) return
        const t = document.shapes[index]
        document.shapes[index] = document.shapes[index + 1]
        document.shapes[index + 1] = t
      })
    return this
  }

  /** Send shapes backward in the shape stack. */
  @action sendBackward = (shapes?: S[] | string[]): this => {
    const { document } = this
    const modelsToMove = this.parseShapesFromShapeArg(shapes ?? this.selectedShapesArray).map(
      shape => shape.model
    )
    modelsToMove
      .sort((a, b) => document.shapes.indexOf(a) - document.shapes.indexOf(b))
      .map(shape => document.shapes.indexOf(shape))
      .forEach(index => {
        if (index === 0) return
        const next = document.shapes[index - 1]
        if (modelsToMove.includes(next)) return
        const t = document.shapes[index]
        document.shapes[index] = document.shapes[index - 1]
        document.shapes[index - 1] = t
      })
    return this
  }

  /** Bring shapes to the front of the shape stack. */
  @action bringToFront = (shapes?: S[] | string[]): this => {
    const { document } = this
    const modelsToMove = this.parseShapesFromShapeArg(shapes ?? this.selectedShapesArray).map(
      shape => shape.model
    )
    document.shapes = document.shapes
      .filter(model => !modelsToMove.includes(model))
      .concat(modelsToMove)
    return this
  }

  /** Send shapes to the back of the shape stack. */
  @action sendToBack = (shapes?: S[] | string[]): this => {
    const { document } = this
    const modelsToMove = this.parseShapesFromShapeArg(shapes ?? this.selectedShapesArray).map(
      shape => shape.model
    )
    document.shapes = modelsToMove.concat(
      document.shapes.filter(shape => !modelsToMove.includes(shape))
    )
    return this
  }

  /** Flip shapes horizontally or vertically. */
  flip = (direction: 'horizontal' | 'vertical', shapes?: S[] | string[]): this => {
    const shapesToMove = this.parseShapesFromShapeArg(shapes ?? this.selectedShapesArray)
    const commonBounds = BoundsUtils.getCommonBounds(shapesToMove.map(shape => shape.bounds))
    shapesToMove.forEach(shape => {
      const relativeBounds = BoundsUtils.getRelativeTransformedBoundingBox(
        commonBounds,
        commonBounds,
        shape.bounds,
        direction === 'horizontal',
        direction === 'vertical'
      )
      shape.onResize(shape.model, {
        bounds: relativeBounds,
        center: BoundsUtils.getBoundsCenter(relativeBounds),
        rotation: shape.model.rotation ?? 0 * -1,
        type: TLResizeCorner.TopLeft,
        scale:
          shape.canFlip && shape.model.scale
            ? direction === 'horizontal'
              ? [-shape.model.scale[0], 1]
              : [1, -shape.model.scale[1]]
            : [1, 1],
        clip: false,
        transformOrigin: [0.5, 0.5],
      })
    })
    return this
  }

  /** Flip shapes horizontally. */
  flipHorizontal = (shapes: S[] | string[] = this.selectedShapesArray): this => {
    this.flip('horizontal', shapes)
    return this
  }

  /** Flip shapes vertically. */
  flipVertical = (shapes: S[] | string[] = this.selectedShapesArray): this => {
    this.flip('vertical', shapes)
    return this
  }

  /** Open a new document. */
  open = (): this => {
    // todo
    this.events.notify('open', null)
    return this
  }

  /** Save the current document. */
  save = (): this => {
    // todo
    this.events.notify('save', null)
    return this
  }

  /** Save the current document as a new document. */
  saveAs = (): this => {
    // todo
    this.events.notify('saveAs', null)
    return this
  }

  /**
   * Set the hovered shape.
   *
   * @param shape The new hovered shape or shape id.
   */
  hoverShape = (shape: string | S | undefined): this => {
    this.setHoveredShape(shape)
    return this
  }

  /**
   * Create one or more shapes on the current page.
   *
   * @param shapes One or more new partial shape models. Must include a type for each shape.
   */
  createShape = (...partials: (Partial<S['model']> & { type: S['model']['type'] })[]): this => {
    this.createShapes(partials)
    return this
  }

  /**
   * Update one or more shapes on the current page.
   *
   * @param shapes One or more oserialized shape changes to apply. Must include an id for each shape.
   */
  updateShape = <T extends S>(...partials: (Partial<T['model']> & { id: string })[]): this => {
    this.updateShapes(partials.map(partial => this.getShape(partial.id).model))
    return this
  }

  /**
   * Delete one or more shapes from the current page.
   *
   * @param shapes The shapes or shape ids to delete.
   */
  deleteShape = (...shapes: S[] | S['model'][]): this => {
    this.deleteShapes(shapes.length ? shapes : this.selectedShapesArray)
    return this
  }

  /**
   * Select one or more shapes on the current page.
   *
   * @param shapes The shapes or shape ids to select.
   */
  selectShapes = (...shapes: S[] | string[]): this => {
    this.setSelectedShapes(shapes)
    return this
  }

  /**
   * Deselect one or more selected shapes on the current page.
   *
   * @param ids The shapes or shape ids to deselect.
   */
  deselectShapes = (...shapes: S[] | string[]): this => {
    const ids =
      typeof shapes[0] === 'string' ? (shapes as string[]) : (shapes as S[]).map(shape => shape.id)
    this.setSelectedShapes(this.selectedShapesArray.filter(shape => !ids.includes(shape.id)))
    return this
  }

  /** Select all shapes on the current page. */
  selectAll = (): this => {
    this.setSelectedShapes(Array.from(this.shapes.keys()))
    return this
  }

  /** Deselect all shapes on the current page. */
  deselectAll = (): this => {
    this.setSelectedShapes([])
    return this
  }

  /** Zoom the camera in. */
  zoomIn = (): this => {
    this.viewport.zoomIn()
    return this
  }

  /** Zoom the camera out. */
  zoomOut = (): this => {
    this.viewport.zoomOut()
    return this
  }

  /** Reset the camera to 100%. */
  resetZoom = (): this => {
    this.viewport.resetZoom()
    return this
  }

  /** Zoom to fit all of the current page's shapes in the viewport. */
  zoomToFit = (): this => {
    const { shapes } = this
    if (shapes.size === 0) return this
    const commonBounds = BoundsUtils.getCommonBounds(
      Array.from(shapes.values()).map(shape => shape.bounds)
    )
    this.viewport.zoomToBounds(commonBounds)
    return this
  }

  /** Zoom to fit the current selection in the viewport. */
  zoomToSelection = (): this => {
    const { selectionBounds } = this
    if (!selectionBounds) return this
    this.viewport.zoomToBounds(selectionBounds)
    return this
  }

  /** Toggle the grid setting. */
  toggleGrid = (): this => {
    const { showGrid } = this.userSettings
    this.updateUserSettings({ showGrid: !showGrid })
    return this
  }

  /** Toggle the tool lock state. */
  toggleToolLock = (): this => {
    const { isToolLocked } = this.userState
    this.updateUserState({ isToolLocked: !isToolLocked })
    return this
  }

  /** Undo to the previous frame. */
  undo = () => this.history.undo()

  /** Redo to the next frame. */
  redo = () => this.history.redo()

  /** Pause the history. Any further changes will be coalesced into the current frame. */
  pause = () => this.history.pause()

  /** Unpause the history. The next change will produce a new frame. */
  resume = () => this.history.resume()

  /** Clone a new instance of the app. */
  clone = (): TLApp<S, K> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this.constructor({
      id: this.id,
      document: toJS(this.document),
      shapes: Array.from(this.registeredShapes.values()),
    })
  }
}
