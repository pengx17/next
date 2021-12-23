/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, makeObservable, computed, observable } from 'mobx'
import type { TLBinding, TLEventMap, TLPageModel } from '~types'
import type { TLApp, TLShape } from '~lib'
import type { TLShapeModel } from '~types'

export interface TLPageProps<S> {
  id: string
  name: string
  shapes: S[]
  bindings: TLBinding[]
}

export class TLPage<S extends TLShape = TLShape, E extends TLEventMap = TLEventMap> {
  constructor(app: TLApp<S, E>, id: string, name = 'Page') {
    this.id = id
    this.app = app
    this.name = name
    makeObservable(this)
  }

  id: string
  app: TLApp<S, E>
  name: string

  @observable shapes: S[] = []
  @observable bindings: TLBinding[] = []

  @action addShapes(shapes: S[] | TLShapeModel[]) {
    if (shapes.length === 0) return
    const shapeInstances =
      'getBounds' in shapes[0]
        ? (shapes as S[])
        : (shapes as TLShapeModel[]).map(shapeModel => {
            const ShapeClass = this.app.getShapeConstructor(shapeModel.type)
            const shape = new ShapeClass(shapeModel)
            return shape
          })
    this.shapes.push(...shapeInstances)
    this.bump()
    this.app.saveState()
    return this
  }

  @action removeShapes(...shapes: S[] | string[]) {
    const shapesToRemove: S[] =
      typeof shapes[0] === 'string'
        ? (shapes as string[]).map(id => this.shapes.find(s => s.id === id)!)
        : (shapes as S[])

    this.shapes = this.shapes.filter(shape => !shapesToRemove.includes(shape))
    return this
    // this.bump()
    // this.app.persist()
  }

  @action bringForward = (shapes: S[] | string[]): this => {
    const shapesToMove = this.parseShapesArg(shapes)
    shapesToMove
      .sort((a, b) => this.shapes.indexOf(b) - this.shapes.indexOf(a))
      .map(shape => this.shapes.indexOf(shape))
      .forEach(index => {
        if (index === this.shapes.length - 1) return
        const next = this.shapes[index + 1]
        if (shapesToMove.includes(next)) return
        const t = this.shapes[index]
        this.shapes[index] = this.shapes[index + 1]
        this.shapes[index + 1] = t
      })
    return this
  }

  @action sendBackward = (shapes: S[] | string[]): this => {
    const shapesToMove = this.parseShapesArg(shapes)
    shapesToMove
      .sort((a, b) => this.shapes.indexOf(a) - this.shapes.indexOf(b))
      .map(shape => this.shapes.indexOf(shape))
      .forEach(index => {
        if (index === 0) return
        const next = this.shapes[index - 1]
        if (shapesToMove.includes(next)) return
        const t = this.shapes[index]
        this.shapes[index] = this.shapes[index - 1]
        this.shapes[index - 1] = t
      })
    return this
  }

  @action bringToFront = (shapes: S[] | string[]): this => {
    const shapesToMove = this.parseShapesArg(shapes)
    this.shapes = this.shapes.filter(shape => !shapesToMove.includes(shape)).concat(shapesToMove)
    return this
  }

  @action sendToBack = (shapes: S[] | string[]): this => {
    const shapesToMove = this.parseShapesArg(shapes)
    this.shapes = shapesToMove.concat(this.shapes.filter(shape => !shapesToMove.includes(shape)))
    return this
  }

  // TODO: How to avoid making deep copies when shapes have not changed?
  @computed get serialized(): TLPageModel {
    return {
      id: this.id,
      name: this.name,
      shapes: this.shapes.map(shape => shape.serialized),
      bindings: this.bindings,
    }
  }

  nonce = 0

  private bump = () => {
    this.nonce++
  }

  private parseShapesArg<S>(shapes: S[] | string[]) {
    if (typeof shapes[0] === 'string') {
      return this.shapes.filter(shape => (shapes as string[]).includes(shape.id))
    } else {
      return shapes as S[]
    }
  }
}
