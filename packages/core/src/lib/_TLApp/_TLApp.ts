/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { action, computed, makeObservable, observable, toJS } from 'mobx'
import { uniqueId } from '~utils'

export type IdMap<K extends { id: string }> = Record<string, K>

export interface TLHandle {
  id: string
  point: number[]
}

export interface TLAssetModel {
  id: string
  type: any
  src: string
}

export interface TLShapeModel {
  id: string
  type: any
  point: number[]
  name?: string
  parentId?: string
  scale?: number[]
  rotation?: number
  handles?: IdMap<TLHandle>
  label?: string
  labelPosition?: number[]
  clipping?: number | number[]
  assetId?: string
  children?: string[]
  isGhost?: boolean
  isHidden?: boolean
  isLocked?: boolean
  isGenerated?: boolean
  isSizeLocked?: boolean
  isAspectRatioLocked?: boolean
}

export interface TLAppState {
  camera: number[]
  selectedIds: []
}

export interface TLDocumentModel<S extends TLShapeModel, A extends TLAssetModel> {
  shapes: S[]
  assets: A[]
}

export interface TLAppConstructorParams<
  S extends TLShapeModel = TLShapeModel,
  A extends TLAssetModel = TLAssetModel
> {
  id: string
  document: TLDocumentModel<S, A>
  shapes: TLShapeConstructor<S>[]
  appState: TLAppState
}

/* -------------------------------------------------- */
/*                         App                        */
/* -------------------------------------------------- */

export class TLApp<S extends TLShapeModel, A extends TLAssetModel = TLAssetModel> {
  id: string

  @observable document: TLDocumentModel<S, A> = {
    shapes: [],
    assets: [],
  }

  @observable appState: TLAppState = {
    camera: [0, 0, 1],
    selectedIds: [],
  }

  @observable shapes = new Map<string, TLShape<S>>()

  private registeredShapes = new Map<string, TLShapeConstructor<S>>()

  constructor(params = {} as Partial<TLAppConstructorParams<S, A>>) {
    const { id = 'app', document, appState, shapes = [] } = params
    this.id = id
    this.shapes.clear()
    if (shapes) this.registerShapes(shapes)
    if (appState) this.updateAppState(appState)
    if (document) this.loadModel(document)
    makeObservable(this)
  }

  /** Register a shape constructor. */
  @action registerShapes(shapeCtors: TLShapeConstructor<S>[]) {
    shapeCtors.forEach(shapeCtor => this.registeredShapes.set(shapeCtor.type, shapeCtor))
  }

  /** Load a document model. */
  @action loadModel(model: TLDocumentModel<S, A>) {
    this.document.assets = []
    this.document.shapes = []
    this.addAssets(model.assets)
    this.addShapes(model.shapes)
  }

  @action updateAppState(appState: TLAppState) {
    Object.assign(this.appState, appState)
  }

  /** Add shapes to the document model. */
  @action addShapes(shapeModels: S[], index = this.document.shapes.length) {
    this.document.shapes.splice(index, 0, ...shapeModels)
    shapeModels.forEach(shapeModel => {
      const ShapeCtor = this.registeredShapes.get(shapeModel.type)
      if (!ShapeCtor) throw Error(`Shape type "${shapeModel.type}" is not registered.`)
      this.shapes.set(shapeModel.id, new ShapeCtor(this, shapeModel.id))
    })
  }

  /** Delete shapes from the document model. */
  @action deleteShapes(shapeModels: S[]) {
    shapeModels.forEach(shapeModel => this.shapes.delete(shapeModel.id))
    this.document.shapes = this.document.shapes.filter(
      shapeModel => !shapeModels.includes(shapeModel)
    )
  }

  /** Update shapes in the document model. */
  @action updateShapes(shapeModels: S[]) {
    shapeModels.forEach(shapeModel => {
      const shape = this.shapes.get(shapeModel.id)
      if (shape) shape.update(shapeModel)
    })
  }

  /** Add assets to the document model. */
  @action addAssets(assetModels: A[]) {
    this.document.assets.push(...assetModels)
  }

  /** Delete assets from the document model. */
  @action deleteAssets(assetModels: A[]) {
    this.document.assets = this.document.assets.filter(
      assetModel => !assetModels.includes(assetModel)
    )
  }

  /** Update assets in the document model. */
  @action updateAssets(assetModels: A[]) {
    assetModels.forEach(assetModel => {
      const asset = this.document.assets.find(asset => asset.id === assetModel.id)
      if (asset) Object.assign(asset, assetModel)
    })
  }

  /** Get the model for a shape by its Id. */
  getShapeModel = (id: string): S => {
    const shape = this.shapes.get(id)
    if (!shape) throw Error(`Shape "${id}" not found.`)
    return shape.model
  }

  /** Get a shape by its Id. */
  getShape = <T extends S>(id: string) => this.shapes.get(id) as TLShape<T>

  /** Clone the app into a new TLApp instance. */
  clone = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return new this.constructor({
      id: this.id,
      document: toJS(this.document),
      shapes: Array.from(this.registeredShapes.values()),
    })
  }
}

/* -------------------------------------------------- */
/*                        Shape                       */
/* -------------------------------------------------- */

export interface TLShapeConstructor<S extends TLShapeModel> {
  new (app: TLApp<S>, id: string): TLShape<S>
  type: string
}

export class TLShape<S extends TLShapeModel> {
  static type = 'shape'

  constructor(public app: TLApp<S>, public id: string) {
    makeObservable(this)
  }

  @computed get model(): S {
    const { id, app } = this
    return app.document.shapes.find(shapeModel => shapeModel.id === id)! as S
  }

  @computed get zIndex(): number {
    const { id, app } = this
    return app.document.shapes.findIndex(shapeModel => shapeModel.id === id)
  }

  /** Update the shape's props. */
  @action update(change: Partial<S>) {
    Object.assign(this.model, change)
  }

  /** Delete this shape. */
  delete = () => {
    this.app.deleteShapes([this.model])
    return this
  }

  /** Create a new shape from this shape's props. Returns the new shape. */
  clone = (id = uniqueId()) => {
    const { app, model } = this
    app.addShapes([{ ...model, id }], this.zIndex + 1)
    return app.shapes.get(id)
  }
}
