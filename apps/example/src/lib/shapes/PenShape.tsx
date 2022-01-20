/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { getStroke } from 'perfect-freehand'
import { SvgPathUtils, TLDrawShape, TLDrawShapeModel } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { computed, makeObservable } from 'mobx'
import { CustomStyleProps, withClampedStyles } from './style-props'

export interface PenShapeModel extends TLDrawShapeModel, CustomStyleProps {
  type: 'draw'
}

export class PenShape extends TLDrawShape<PenShapeModel> {
  constructor(props = {} as Partial<PenShapeModel>) {
    super(props)
    makeObservable(this)
  }

  static id = 'draw'

  static defaultModel: PenShapeModel = {
    id: 'draw',
    parentId: 'page',
    type: 'draw',
    point: [0, 0],
    points: [],
    isComplete: false,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  @computed get pointsPath() {
    const {
      model: { points, isComplete, strokeWidth },
    } = this
    if (points.length < 2) {
      return `M -4, 0
      a 4,4 0 1,0 8,0
      a 4,4 0 1,0 -8,0`
    }
    const stroke = getStroke(points, { size: 4 + strokeWidth * 2, last: isComplete })
    return SvgPathUtils.getCurvedPathForPolygon(stroke)
  }

  ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
    const {
      pointsPath,
      model: { stroke, strokeWidth, opacity },
    } = this
    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <path
          d={pointsPath}
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={stroke}
          pointerEvents="all"
        />
      </SVGContainer>
    )
  })

  ReactIndicator = observer(() => {
    const { pointsPath } = this
    return <path d={pointsPath} />
  })

  validateProps = (props: Partial<PenShapeModel>) => {
    props = withClampedStyles(props)
    if (props.strokeWidth !== undefined) props.strokeWidth = Math.max(props.strokeWidth, 1)
    return props
  }
}
