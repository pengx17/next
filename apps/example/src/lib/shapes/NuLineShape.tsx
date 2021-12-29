/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLShapeProps, TLHandle, TLLineShapeProps, TLLineShape } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { NuStyleProps, withClampedStyles } from './NuStyleProps'

interface NuLineShapeProps extends NuStyleProps, TLLineShapeProps {
  handles: TLHandle[]
}

export class NuLineShape extends TLLineShape<NuLineShapeProps> {
  static id = 'line'

  defaultProps = {
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
    borderRadius: 0,
    opacity: 1,
  }

  hideSelection = true

  ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
    const {
      points,
      props: { stroke, fill, strokeWidth, opacity },
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

  validateProps = (props: Partial<NuLineShapeProps>) => {
    return withClampedStyles(props)
  }
}
