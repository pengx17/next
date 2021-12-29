/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLShapeProps, assignOwnProps, TLPolygonShape, TLPolygonShapeProps } from '@tldraw/core'
import { SVGContainer, TLComponentProps, TLIndicatorProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { makeObservable, observable } from 'mobx'
import { NuStyleProps, withClampedStyles } from './NuStyleProps'

interface NuPolygonShapeProps extends NuStyleProps, TLPolygonShapeProps {}

export class NuPolygonShape extends TLPolygonShape<NuPolygonShapeProps> {
  constructor(props = {} as TLShapeProps & Partial<NuPolygonShapeProps>) {
    super(props)
    assignOwnProps(this, props)
    makeObservable(this)
  }

  @observable stroke = '#000000'
  @observable fill = '#ffffff'
  @observable strokeWidth = 2
  @observable opacity = 1

  static id = 'polygon'

  ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
    const {
      offset: [x, y],
      stroke,
      fill,
      strokeWidth,
      opacity,
    } = this

    const path = this.getVertices(strokeWidth / 2).join()

    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <g transform={`translate(${x}, ${y})`}>
          <polygon className={isSelected ? 'tl-hitarea-fill' : 'tl-hitarea-stroke'} points={path} />
          <polygon
            points={path}
            stroke={stroke}
            fill={fill}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </g>
      </SVGContainer>
    )
  })

  ReactIndicator = observer((props: TLIndicatorProps) => {
    const {
      offset: [x, y],
      strokeWidth,
    } = this

    return (
      <polygon
        transform={`translate(${x}, ${y})`}
        points={this.getVertices(strokeWidth / 2).join()}
      />
    )
  })

  validateProps = (props: Partial<NuPolygonShapeProps & TLShapeProps>) => {
    if (props.sides !== undefined) props.sides = Math.max(props.sides, 3)
    return withClampedStyles(props)
  }
}
