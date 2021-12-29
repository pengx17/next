/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { SvgPathUtils, TLDrawShape, TLDrawShapeProps, TLShapeProps } from '@tldraw/core'
import { SVGContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { observable, computed, makeObservable } from 'mobx'
import { NuStyleProps, withClampedStyles } from './NuStyleProps'

export interface NuHighlighterShapeProps extends TLDrawShapeProps, NuStyleProps {}

export class NuHighlighterShape extends TLDrawShape<NuHighlighterShapeProps> {
  constructor(props = {} as Partial<NuHighlighterShapeProps>) {
    super(props)
    makeObservable(this)
  }

  static id = 'highlighter'

  defaultProps = {
    id: 'highlighter',
    parentId: 'page',
    type: 'highlighter',
    point: [0, 0],
    points: [],
    isComplete: false,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    borderRadius: 0,
    opacity: 1,
  }

  @observable stroke = '#e9ff32'
  @observable fill = '#000000'
  @observable strokeWidth = 2
  @observable opacity = 1

  @computed get pointsPath() {
    const { points } = this.props
    return SvgPathUtils.getCurvedPathForPoints(points)
  }

  ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
    const {
      pointsPath,
      props: { stroke, strokeWidth, opacity },
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

  validateProps = (props: Partial<NuHighlighterShapeProps>) => {
    props = withClampedStyles(props)
    if (props.strokeWidth !== undefined) props.strokeWidth = Math.max(props.strokeWidth, 1)
    return props
  }
}
