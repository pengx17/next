/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { action, observable, makeObservable, computed, observe } from 'mobx'
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
  constructor(app: TLApp<S, E>, id: string) {
    this.id = id
    this.app = app
    makeObservable(this)
  }

  id: string
  app: TLApp<S, E>

  shapes = new Map<string, S>([])
  bindings = new Map<string, TLBinding>([])

  @computed get props() {
    return this.app.document.pages.find(page => page.id === this.id)!
  }

  @action addShapes(...shapes: S[] | TLShapeModel[]) {
    if (shapes.length === 0) return

    const shapeInstances =
      'getBounds' in shapes[0]
        ? (shapes as S[])
        : (shapes as TLShapeModel[]).map(shapeModel => {
            const ShapeClass = this.app.getShapeConstructor(shapeModel.type)
            const shape = new ShapeClass(this.app, this.id, shapeModel.id)
            this.props.shapes.push({ ...shape.defaultProps, ...shapeModel })
            return shape
          })

    shapeInstances.forEach(shape => this.shapes.set(shape.id, shape))
    this.bump()
    this.app.saveState()
    return this
  }

  @action removeShapes(...shapes: S[] | string[]) {
    const shapesToRemove: S[] =
      typeof shapes[0] === 'string'
        ? (shapes as string[]).map(id => this.shapes.get(id)!)
        : (shapes as S[])

    shapesToRemove.forEach(shape => this.shapes.delete(shape.id))

    this.props.shapes = this.props.shapes.filter(props => this.shapes.has(props.id))

    return this
    // this.bump()
    // this.app.persist()
  }

  @action bringForward = (shapes: S[] | string[]): this => {
    // const shapesToMove = this.parseShapesArg(shapes)
    // shapesToMove
    //   .sort((a, b) => this.shapes.indexOf(b) - this.shapes.indexOf(a))
    //   .map(shape => this.shapes.indexOf(shape))
    //   .forEach(index => {
    //     if (index === this.shapes.length - 1) return
    //     const next = this.shapes[index + 1]
    //     if (shapesToMove.includes(next)) return
    //     const t = this.shapes[index]
    //     this.shapes[index] = this.shapes[index + 1]
    //     this.shapes[index + 1] = t
    //   })
    return this
  }

  @action sendBackward = (shapes: S[] | string[]): this => {
    // const shapesToMove = this.parseShapesArg(shapes)
    // shapesToMove
    //   .sort((a, b) => this.shapes.indexOf(a) - this.shapes.indexOf(b))
    //   .map(shape => this.shapes.indexOf(shape))
    //   .forEach(index => {
    //     if (index === 0) return
    //     const next = this.shapes[index - 1]
    //     if (shapesToMove.includes(next)) return
    //     const t = this.shapes[index]
    //     this.shapes[index] = this.shapes[index - 1]
    //     this.shapes[index - 1] = t
    //   })
    return this
  }

  @action bringToFront = (shapes: S[] | string[]): this => {
    // const shapesToMove = this.parseShapesArg(shapes)
    // this.shapes = this.shapes.filter(shape => !shapesToMove.includes(shape)).concat(shapesToMove)
    return this
  }

  @action sendToBack = (shapes: S[] | string[]): this => {
    // const shapesToMove = this.parseShapesArg(shapes)
    // this.shapes = shapesToMove.concat(this.shapes.filter(shape => !shapesToMove.includes(shape)))
    return this
  }

  // TODO: How to avoid making deep copies when shapes have not changed?
  @computed get serialized(): TLPageModel {
    return this.props
  }

  nonce = 0

  private bump = () => {
    this.nonce++
  }

  @action update(props: Partial<TLPageProps<S>>) {
    Object.assign(this.props, props)
    return this
  }

  // private parseShapesArg<S>(shapes: S[] | string[]) {
  //   if (typeof shapes[0] === 'string') {
  //     return this.shapes.filter(shape => (shapes as string[]).includes(shape.id))
  //   } else {
  //     return shapes as S[]
  //   }
  // }
}
