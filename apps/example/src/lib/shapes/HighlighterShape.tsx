/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { SvgPathUtils, TLApp, TLDrawShape, TLDrawShapeModel } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { computed, makeObservable } from 'mobx'
import { CustomStyleProps, withClampedStyles } from './style-props'

export interface HighlighterShapeModel extends TLDrawShapeModel, CustomStyleProps {
  type: 'highlighter'
}

export class HighlighterShape extends TLDrawShape<HighlighterShapeModel> {
  constructor(public app: TLApp, public id: string) {
    super(app, id)
    makeObservable(this)
  }

  static id = 'highlighter'

  static defaultModel: HighlighterShapeModel = {
    id: 'highlighter',
    parentId: 'page',
    type: 'highlighter',
    point: [0, 0],
    points: [],
    isComplete: false,
    stroke: '#ffcc00',
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
      model: { stroke, strokeWidth, opacity },
    } = this

    return (
      <SVGContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <path
          d={pointsPath}
          strokeWidth={strokeWidth * 16}
          stroke={stroke}
          fill="none"
          pointerEvents="all"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.5}
        />
      </SVGContainer>
    )
  })

  ReactIndicator = observer(() => {
    const { pointsPath } = this
    return <path d={pointsPath} fill="none" />
  })

  validateProps = (props: Partial<HighlighterShapeModel>) => {
    props = withClampedStyles(props)
    if (props.strokeWidth !== undefined) props.strokeWidth = Math.max(props.strokeWidth, 1)
    return props
  }
}
