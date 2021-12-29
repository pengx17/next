import { makeObservable } from 'mobx'
import type { TLHandle } from '~types'
import type { TLShapeProps } from '~lib'
import { TLPolylineShape, TLPolylineShapeProps } from '../TLPolylineShape'

export interface TLLineShapeProps extends TLPolylineShapeProps {
  handles: TLHandle[]
}

export class TLLineShape<
  P extends TLLineShapeProps = TLLineShapeProps,
  M = any
> extends TLPolylineShape<P, M> {
  constructor(props = {} as Partial<P>) {
    super(props)
    this.props = { ...this.defaultProps, ...this.props }
    makeObservable(this)
  }

  static id = 'line'

  validateProps = (props: Partial<TLShapeProps> & Partial<P>) => {
    if (props.point) props.point = [0, 0]
    if (props.handles !== undefined && props.handles.length < 1) props.handles = [{ point: [0, 0] }]
    return props
  }
}
