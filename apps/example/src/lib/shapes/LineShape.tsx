/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLHandle, TLLineShapeModel, TLLineShape } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'

interface LineShapeModel extends CustomStyleProps, TLLineShapeModel {
  type: 'line'
  handles: TLHandle[]
}

export class LineShape extends TLLineShape<LineShapeModel> {
  static id = 'line'

  static defaultModel: LineShapeModel = {
    id: 'line',
    parentId: 'page',
    type: 'line',
    point: [0, 0],
    handles: [
      { id: 'start', point: [0, 0] },
      { id: 'end', point: [1, 1] },
    ],
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  hideSelection = true

  ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
    const {
      points,
      model: { stroke, fill, strokeWidth, opacity },
    } = this
    const path = points.join()
    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <g>
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

  ReactIndicator = observer(() => {
    const { points } = this
    const path = points.join()
    return <polygon points={path} />
  })

  validateProps = (props: Partial<LineShapeModel>) => {
    return withClampedStyles(props)
  }
}
