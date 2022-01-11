/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { HTMLContainer, TLComponentProps } from '@tldraw/react'
import { TLTextShape, TLTextShapeProps } from '@tldraw/core'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'

export interface TextShapeProps extends TLTextShapeProps, CustomStyleProps {
  borderRadius: number
  type: 'text'
}

export class TextShape extends TLTextShape<TextShapeProps> {
  static id = 'text'

  static defaultProps: TextShapeProps = {
    id: 'box',
    parentId: 'page',
    type: 'text',
    point: [0, 0],
    text: '',
    borderRadius: 0,
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
  }

  ReactComponent = observer(({ events, isErasing, isSelected }: TLComponentProps) => {
    const {
      props: { text, opacity },
    } = this
    console.log('text')
    return (
      <HTMLContainer {...events} opacity={isErasing ? 0.2 : opacity}>
        <div>{text}</div>
      </HTMLContainer>
    )
  })

  ReactIndicator = observer(() => {
    const {
      props: { borderRadius },
      bounds,
    } = this
    return (
      <rect
        width={bounds.width}
        height={bounds.height}
        rx={borderRadius}
        ry={borderRadius}
        fill="transparent"
      />
    )
  })

  validateProps = (props: Partial<TextShapeProps>) => {
    if (props.borderRadius !== undefined) props.borderRadius = Math.max(0, props.borderRadius)
    return withClampedStyles(props)
  }
}
