/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLPolylineShape, TLPolylineShapeModel } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'

interface PolylineShapeModel extends CustomStyleProps, TLPolylineShapeModel {
  type: 'polyline'
}

export class PolylineShape extends TLPolylineShape<PolylineShapeModel> {
  hideSelection = true

  static id = 'polyline'

  static defaultModel: PolylineShapeModel = {
    id: 'box',
    type: 'polyline',
    parentId: 'page',
    point: [0, 0],
    handles: [],
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
    const {
      points,
      model: { stroke, strokeWidth, opacity },
    } = this
    const path = points.join()
    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <g>
          <polyline className={'tl-hitarea-stroke'} points={path} />
          <polyline
            points={path}
            stroke={stroke}
            fill={'none'}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
          />
        </g>
      </SVGContainer>
    )
  })

  ReactIndicator = observer(() => {
    const { points } = this
    const path = points.join()
    return <polyline points={path} />
  })

  validateProps = (props: Partial<PolylineShapeModel>) => {
    return withClampedStyles(props)
  }
}
