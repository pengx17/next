/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import {
  TLBounds,
  PointUtils,
  BoundsUtils,
  TLResizeInfo,
  TLShapeProps,
  assignOwnProps,
  TLCustomProps,
} from '@tldraw/core'
import { SVGContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
import { TLBoxShape } from '@tldraw/box-shape'
import { observer } from 'mobx-react-lite'
import { observable, makeObservable } from 'mobx'
import { intersectEllipseBounds, intersectLineSegmentEllipse } from '@tldraw/intersect'
import { NuStyleProps, withClampedStyles } from './NuStyleProps'

export interface NuEllipseShapeProps extends NuStyleProps {
  size: number[]
}

export class NuEllipseShape extends TLBoxShape<NuEllipseShapeProps> {
  constructor(props = {} as TLCustomProps<NuEllipseShapeProps>) {
    super(props)
    assignOwnProps(this, props)
    makeObservable(this)
  }

  static id = 'ellipse'

  @observable stroke = '#000000'
  @observable fill = '#ffffff'
  @observable strokeWidth = 2
  @observable opacity = 1

  ReactComponent = observer(({ isSelected, isErasing, events }: TLComponentProps) => {
    const {
      size: [w, h],
      stroke,
      fill,
      strokeWidth,
      opacity,
    } = this

    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <ellipse
          className={isSelected ? 'tl-hitarea-fill' : 'tl-hitarea-stroke'}
          cx={w / 2}
          cy={h / 2}
          rx={Math.max(0.01, (w - strokeWidth) / 2)}
          ry={Math.max(0.01, (h - strokeWidth) / 2)}
        />
        <ellipse
          cx={w / 2}
          cy={h / 2}
          rx={Math.max(0.01, (w - strokeWidth) / 2)}
          ry={Math.max(0.01, (h - strokeWidth) / 2)}
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={fill}
        />
      </SVGContainer>
    )
  })

  ReactIndicator = observer((props: TLIndicatorProps) => {
    return (
      <ellipse
        cx={this.size[0] / 2}
        cy={this.size[1] / 2}
        rx={this.size[0] / 2}
        ry={this.size[1] / 2}
        strokeWidth={2}
        fill="transparent"
      />
    )
  })

  getBounds = (): TLBounds => {
    const [x, y] = this.point
    const [width, height] = this.size
    return BoundsUtils.getRotatedEllipseBounds(x, y, width / 2, height / 2, 0)
  }

  getRotatedBounds = (): TLBounds => {
    const [x, y] = this.point
    const [width, height] = this.size
    return BoundsUtils.getRotatedEllipseBounds(x, y, width / 2, height / 2, this.rotation)
  }

  hitTestPoint = (point: number[]) => {
    return PointUtils.pointInEllipse(
      point,
      this.center,
      this.size[0],
      this.size[1],
      this.rotation || 0
    )
  }

  hitTestLineSegment = (A: number[], B: number[]): boolean => {
    return intersectLineSegmentEllipse(
      A,
      B,
      this.center,
      this.size[0],
      this.size[1],
      this.rotation || 0
    ).didIntersect
  }

  hitTestBounds = (bounds: TLBounds): boolean => {
    const { rotatedBounds } = this

    return (
      BoundsUtils.boundsContain(bounds, rotatedBounds) ||
      intersectEllipseBounds(
        this.center,
        this.size[0] / 2,
        this.size[1] / 2,
        this.rotation || 0,
        bounds
      ).length > 0
    )
  }

  onResize = (bounds: TLBounds, info: TLResizeInfo<typeof this.props>) => {
    return this.update({
      point: [bounds.minX, bounds.minY],
      size: [Math.max(1, bounds.width), Math.max(1, bounds.height)],
    })
  }

  validateProps = (props: Partial<TLShapeProps & NuEllipseShapeProps>) => {
    if (props.size !== undefined) {
      props.size[0] = Math.max(props.size[0], 1)
      props.size[1] = Math.max(props.size[1], 1)
    }
    return withClampedStyles(props)
  }
}
