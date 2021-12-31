/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, observable, makeObservable, computed, observe } from 'mobx'
import type { TLBinding, TLEventMap } from '~types'
import type { TLApp, TLShape, TLShapeModel } from '~lib'

export interface TLPageModel<S extends TLShape = TLShape> {
  id: string
  name: string
  shapes: TLShapeModel<S['props']>[]
  bindings: TLBinding[]
  nonce?: number
}

export interface TLPageProps<S> {
  id: string
  name: string
  shapes: S[]
  bindings: TLBinding[]
}

export class TLPage<S extends TLShape = TLShape, E extends TLEventMap = TLEventMap> {
  constructor(app: TLApp<S, E>, props = {} as TLPageProps<S>) {
    const { id, name, shapes = [], bindings = [] } = props
    this.id = id
    this.name = name
    this.bindings = bindings
    this.app = app
    this.addShapes(...shapes)
    makeObservable(this)
  }

  app: TLApp<S, E>

  @observable id: string

  @observable name: string

  @observable shapes: S[] = []

  @observable bindings: TLBinding[]

  @action addShapes(...shapes: S[] | TLShapeModel[]) {
    if (shapes.length === 0) return

    const shapeInstances =
      'getBounds' in shapes[0]
        ? (shapes as S[])
        : (shapes as TLShapeModel[]).map(shape => {
            const ShapeClass = this.app.getShapeClass(shape.type)
            return new ShapeClass(shape)
          })

    shapeInstances.forEach(instance => observe(instance, this.app.saveState))

    this.shapes.push(...shapeInstances)
    this.bump()
    this.app.saveState()
    return this
  }

  @action removeShapes(...shapes: S[] | string[]) {
    if (typeof shapes[0] === 'string') {
      this.shapes = this.shapes.filter(shape => !(shapes as string[]).includes(shape.id))
    } else {
      this.shapes = this.shapes.filter(shape => !(shapes as S[]).includes(shape))
    }
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
  @computed get serialized(): TLPageModel<S> {
    return {
      id: this.id,
      name: this.name,
      shapes: this.shapes.map(shape => shape.serialized),
      bindings: this.bindings.map(binding => ({ ...binding })),
      nonce: this.nonce,
    }
  }

  nonce = 0

  private bump = () => {
    this.nonce++
  }

  @action update(props: Partial<TLPageProps<S>>) {
    Object.assign(this, props)
    return this
  }

  private parseShapesArg<S>(shapes: S[] | string[]) {
    if (typeof shapes[0] === 'string') {
      return this.shapes.filter(shape => (shapes as string[]).includes(shape.id))
    } else {
      return shapes as S[]
    }
  }
}
