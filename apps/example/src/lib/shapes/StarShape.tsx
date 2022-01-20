/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLStarShape, TLStarShapeModel } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'

interface StarShapeModel extends CustomStyleProps, TLStarShapeModel {
  type: 'star'
}

export class StarShape extends TLStarShape<StarShapeModel> {
  static id = 'star'

  static defaultModel: StarShapeModel = {
    id: 'star',
    parentId: 'page',
    type: 'star',
    point: [0, 0],
    size: [100, 100],
    sides: 5,
    ratio: 1,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
    const {
      offset: [x, y],
      model: { stroke, fill, strokeWidth, opacity },
    } = this

    const path = this.getVertices(strokeWidth / 2).join()

    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <polygon
          className={isSelected ? 'tl-hitarea-fill' : 'tl-hitarea-stroke'}
          transform={`translate(${x}, ${y})`}
          points={path}
        />
        <polygon
          transform={`translate(${x}, ${y})`}
          points={path}
          stroke={stroke}
          fill={fill}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </SVGContainer>
    )
  })

  ReactIndicator = observer(() => {
    const {
      offset: [x, y],
      model: { strokeWidth },
    } = this
    return (
      <polygon
        transform={`translate(${x}, ${y})`}
        points={this.getVertices(strokeWidth / 2).join()}
      />
    )
  })

  validateProps = (props: Partial<StarShapeModel>) => {
    if (props.sides !== undefined) props.sides = Math.max(props.sides, 3)
    return withClampedStyles(props)
  }
}
