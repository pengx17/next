import * as React from 'react'
import { TLDotShape, TLDotShapeProps } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { NuStyleProps, withClampedStyles } from './NuStyleProps'

export interface NuDotShapeProps extends TLDotShapeProps, NuStyleProps {}

export class NuDotShape extends TLDotShape<NuDotShapeProps> {
  static id = 'dot'

  defaultProps = {
    id: 'dot',
    parentId: 'page',
    type: 'dot',
    point: [0, 0],
    radius: 4,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    borderRadius: 0,
    opacity: 1,
  }

  ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
    const { radius, stroke, fill, strokeWidth, opacity } = this.props
    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <circle
          className={isSelected ? 'tl-hitarea-fill' : 'tl-hitarea-stroke'}
          cx={radius}
          cy={radius}
          r={radius}
        />
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          stroke={stroke}
          fill={fill}
          strokeWidth={strokeWidth}
          pointerEvents="all"
        />
      </SVGContainer>
    )
  })

  ReactIndicator = observer(() => {
    const { radius } = this.props
    return <circle cx={radius} cy={radius} r={radius} pointerEvents="all" />
  })

  validateProps = (props: Partial<NuDotShapeProps>) => {
    if (props.radius !== undefined) props.radius = Math.max(props.radius, 1)
    return withClampedStyles(props)
  }
}
