/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { SvgPathUtils, TLApp, TLDrawShape, TLDrawShapeModel } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { computed, makeObservable } from 'mobx'
import { CustomStyleProps, withClampedStyles } from './style-props'

export interface PencilShapeModel extends TLDrawShapeModel, CustomStyleProps {
  type: 'pencil'
}

export class PencilShape extends TLDrawShape<PencilShapeModel> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static id = 'pencil'

  static defaultModel: PencilShapeModel = {
    id: 'pencil',
    parentId: 'page',
    type: 'pencil',
    point: [0, 0],
    points: [],
    isComplete: false,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  @computed get pointsPath() {
    const { points } = this.model
    return SvgPathUtils.getCurvedPathForPoints(points)
  }

  ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
    const {
      pointsPath,
      model: { stroke, fill, strokeWidth, opacity },
    } = this
    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <polyline
          points={pointsPath}
          stroke={stroke}
          fill={fill}
          strokeWidth={strokeWidth}
          pointerEvents="all"
        />
      </SVGContainer>
    )
  })

  ReactIndicator = observer(() => {
    const { pointsPath } = this
    return <path d={pointsPath} fill="none" />
  })

  validateProps = (props: Partial<PencilShapeModel>) => {
    return withClampedStyles(props)
  }
}
