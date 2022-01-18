/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { action, computed, makeObservable, observable, reaction, toJS, transaction } from 'mobx'
import type { TLEventMap } from './_types'
import { TLHistoryManager } from './_TLHistoryManager'
import type { TLShape, TLShapeConstructor } from './_shapes/TLShape'
import { TLCursors } from './_TLCursors'
import { TLRootState } from './_TLState'
import { TLInputs } from './_TLInputs'
import { TLViewport } from './_TLViewport'
import type { TLToolConstructor } from '.'

/* -------------------------------------------------- */
/*                        TLApp                       */
/* -------------------------------------------------- */

export interface TLAssetModel {
  id: string
  type: any
  src: string
}

export interface TLAppState {
  camera: number[]
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
  appState: TLAppState
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
    const { document, appState, debug = false, shapes = [] } = params
    this.debug = debug
    this.history = new TLHistoryManager(this)
    this.shapes.clear()
    if (shapes) this.registerShapes(shapes)
    if (appState) this.updateAppState(appState)
    if (document) this.loadDocument(document)
    makeObservable(this)
    reaction(() => toJS(this.document), this.history.persist)
  }

  debug: boolean

  @observable document: TLDocumentModel<S> = {
    shapes: [],
    selectedIds: [],
  }

  @observable appState: TLAppState = {
    camera: [0, 0, 1],
  }

  @observable shapes = new Map<string, S>()

  inputs = new TLInputs()

  viewport = new TLViewport()

  cursors = new TLCursors()

  /** A manager for history, i.e. undo and redo */
  history: TLHistoryManager<S, K>

  /** Undo to the previous frame. */
  @action undo = () => this.history.undo()

  /** Redo to the next frame. */
  @action redo = () => this.history.redo()

  /** Pause the history. Any further changes will be coalesced into the current frame. */
  pause = () => this.history.pause()

  /** Unpause the history. The next change will produce a new frame. */
  unpause = () => this.history.unpause()

  /** A map of registered shape constructors */
  private registeredShapes = new Map<string, TLShapeConstructor<S>>()

  /** Register a shape constructor. */
  @action registerShapes(shapeCtors: TLShapeConstructor<S>[]) {
    shapeCtors.forEach(shapeCtor => this.registeredShapes.set(shapeCtor.type, shapeCtor))
    return this
  }

  /** A map of registered tool constructors */
  private registeredTools = new Map<string, TLShapeConstructor<S>>()

  /** Register a tool constructor. */
  @action registerTools(toolCtors: TLShapeConstructor<S>[]) {
    toolCtors.forEach(toolCtor => this.registeredShapes.set(toolCtor.type, toolCtor))
    return this
  }

  /** Load a document model. */
  @action loadDocument(model: TLDocumentModel<S>) {
    transaction(() => {
      this.document.shapes = []
      this.document.selectedIds = []
      this.addShapes(model.shapes)
      this.setSelectedShapes(model.selectedIds)
    })
    this.history.reset()
    return this
  }

  /** Apply a change to the app state. */
  @action updateAppState(appState: Partial<TLAppState>) {
    Object.assign(this.appState, appState)
    return this
  }

  @action setSelectedShapes(selectedIds: string[]) {
    this.document.selectedIds = selectedIds
    return this
  }

  /** Add shapes to the document model. */
  @action addShapes(shapeModels: S['model'][], index = this.document.shapes.length) {
    this.document.shapes.splice(index, 0, ...shapeModels)
    shapeModels.forEach(shapeModel => {
      const ShapeCtor = this.registeredShapes.get(shapeModel.type)
      if (!ShapeCtor) throw new Error(`Shape type "${shapeModel.type}" is not registered.`)
      this.shapes.set(shapeModel.id, new ShapeCtor(this, shapeModel.id))
    })
    return this
  }

  /** Delete shapes from the document model. */
  @action deleteShapes(shapeModels: S['model'][]) {
    const { shapes, document } = this
    shapeModels.forEach(shapeModel => {
      shapes.delete(shapeModel.id)
      document.shapes.splice(document.shapes.indexOf(shapeModel), 1)
    })
    return this
  }

  /** Update shapes in the document model. */
  @action updateShapes(shapeModels: S['model'][]) {
    shapeModels.forEach(shapeModel => {
      const shape = this.shapes.get(shapeModel.id)
      if (shape) shape.update(shapeModel)
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

  /** Clone the app into a new TLApp instance. */
  clone = (): TLApp<S, K> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this.constructor({
      id: this.id,
      document: toJS(this.document),
      shapes: Array.from(this.registeredShapes.values()),
    })
  }

  get selectedIds() {
    return this.document.selectedIds
  }

  @computed get selectedShapes() {
    return this.selectedIds.map(id => this.getShape(id))
  }
}
