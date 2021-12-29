import Vec from '@tldraw/vec'
import { computed, makeObservable } from 'mobx'
import { createShapeClass, TLShape, TLShapeOptions, TLShapeProps } from '~lib'
import type { TLHandle } from '~types'
import { BoundsUtils } from '~utils'

export interface TLShapeWithHandleProps extends TLShapeProps {
  handles: TLHandle[]
}

export interface TLHandleChangeInfo<
  P extends TLShapeProps = TLShapeProps,
  C extends Record<string, unknown> = Record<string, unknown>
> {
  index: number
  delta: number[]
  initialShape: P
  initialContext: C
}

export interface TLShapeWithHandles<
  P extends TLShapeWithHandleProps = TLShapeWithHandleProps,
  C extends Record<string, unknown> = Record<string, unknown>
> extends TLShape<P, C> {
  handles: TLHandle[]
  onHandleChange(this: TLShapeWithHandles<P, C>, info: TLHandleChangeInfo<P, C>): this
}

export type TLShapeWithHandlesFactory<
  P extends TLShapeWithHandleProps = TLShapeWithHandleProps,
  C extends Record<string, unknown> = Record<string, unknown>
> = {
  new (props: P): TLShapeWithHandles<P, C>
}

export function createShapeWithHandles<
  P extends TLShapeWithHandleProps = TLShapeWithHandleProps,
  C extends Record<string, unknown> = Record<string, unknown>
>(options = {} as TLShapeOptions<P, C> & ThisType<TLShape<P, C>>): TLShapeWithHandlesFactory<P, C> {
  const Shape = createShapeClass(options)

  class ShapeWithHandles extends Shape {
    constructor(props: P & ThisType<TLShapeWithHandles<P, C>>) {
      super(props)
      makeObservable(this, {
        handles: computed,
      })
    }
    get handles() {
      return this.props.handles
    }
    onHandleChange({ initialShape, delta, index }: TLHandleChangeInfo<P, C>) {
      const nextHandles = [...initialShape.handles]
      nextHandles[index] = {
        ...nextHandles[index],
        point: Vec.add(delta, initialShape.handles[index].point),
      }
      const topLeft = BoundsUtils.getCommonTopLeft(nextHandles.map(h => h.point))
      this.update({
        point: Vec.add(initialShape.point, topLeft),
        handles: nextHandles.map(h => ({ ...h, point: Vec.sub(h.point, topLeft) })),
      })
      return this
    }
  }
  return ShapeWithHandles
}
