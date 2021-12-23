import type { TLShapeProps, TLHandle, TLShapeModel, Merge } from '@tldraw/core'
import { TLPolylineShape, TLPolylineShapeProps } from '@tldraw/polyline-shape'

export interface TLLineShapeProps extends TLPolylineShapeProps {
  handles: TLHandle[]
}

export abstract class TLLineShape<
  P extends TLLineShapeProps = TLLineShapeProps
> extends TLPolylineShape<P> {
  static id = 'line'

  static defaultProps: TLLineShapeProps

  validateProps = (props: Partial<TLShapeModel<TLLineShapeProps>>) => {
    if (props.point) props.point = [0, 0]
    if (props.handles !== undefined && props.handles.length < 1) props.handles = [{ point: [0, 0] }]
    return props
  }
}
