/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLBoxShape, TLBoxShapeProps } from '@tldraw/core'
import { HTMLContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { NuStyleProps, withClampedStyles } from './style-props'

export interface YouTubeShapeProps extends TLBoxShapeProps, NuStyleProps {
  type: 'youtube'
  embedId: string
}

export class YouTubeShape extends TLBoxShape<YouTubeShapeProps> {
  static id = 'youtube'

  static defaultProps: YouTubeShapeProps = {
    id: 'youtube',
    type: 'youtube',
    parentId: 'page',
    point: [0, 0],
    size: [600, 320],
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
    embedId: '',
  }

  aspectRatio = 480 / 853

  isAspectRatioLocked = true

  isEditable = true

  ReactComponent = observer(({ events, isEditing, isErasing }: TLComponentProps) => {
    const {
      props: { opacity, embedId },
    } = this
    return (
      <HTMLContainer
        style={{
          overflow: 'hidden',
          pointerEvents: 'all',
          opacity: isErasing ? 0.2 : opacity,
        }}
        {...events}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: isEditing ? 'all' : 'none',
            userSelect: 'none',
          }}
        >
          {embedId ? (
            <div
              style={{
                overflow: 'hidden',
                paddingBottom: '56.25%',
                position: 'relative',
                height: 0,
              }}
            >
              <iframe
                style={{
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                }}
                width="853"
                height="480"
                src={`https://www.youtube.com/embed/${embedId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Embedded youtube"
              />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                backgroundColor: '#FF0000',
                border: '1px solid rgb(52, 52, 52)',
                padding: 16,
              }}
            >
              <input
                type="text"
                style={{
                  padding: '8px 16px',
                  fontSize: '16px',
                  maxWidth: '100%',
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: 8,
                  color: 'black',
                }}
                placeholder="YouTube URL"
                value={embedId}
                onChange={e => {
                  this.update({ embedId: e.currentTarget.value })
                }}
              />
            </div>
          )}
        </div>
      </HTMLContainer>
    )
  })

  ReactIndicator = observer(() => {
    const {
      props: {
        size: [w, h],
      },
    } = this
    return <rect width={w} height={h} fill="transparent" />
  })

  validateProps = (props: Partial<YouTubeShapeProps>) => {
    if (props.size !== undefined) {
      props.size[0] = Math.max(props.size[0], 1)
      props.size[1] = Math.max(props.size[0] * this.aspectRatio, 1)
    }
    return withClampedStyles(props)
  }
}
