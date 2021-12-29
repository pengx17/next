/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import type { TLBoxShapeProps } from '@tldraw/core'
import { HTMLContainer, TLComponentProps, TLReactBoxShape } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { makeObservable } from 'mobx'
import { NuStyleProps, withClampedStyles } from './NuStyleProps'

export interface NuCodeSandboxShapeProps extends TLBoxShapeProps, NuStyleProps {
  embedId: string
}

export class NuCodeSandboxShape extends TLReactBoxShape<NuCodeSandboxShapeProps> {
  constructor(props = {} as Partial<NuCodeSandboxShapeProps>) {
    super(props)
    props.size = props.size ?? [600, 320]
    makeObservable(this)
  }

  static id = 'code'

  isEditable = true

  defaultProps = {
    id: 'code',
    type: 'code',
    parentId: 'page',
    point: [0, 0],
    size: [600, 320],
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    borderRadius: 0,
    opacity: 1,
    embedId: '',
  }

  ReactComponent = observer(({ events, isEditing, isErasing }: TLComponentProps) => {
    const { opacity, embedId } = this.props
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
            <iframe
              src={`https://codesandbox.io/embed/${embedId}?fontsize=14&hidenavigation=1&theme=dark`}
              style={{ width: '100%', height: '100%', overflow: 'hidden' }}
              title={'CodeSandbox'}
              allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                backgroundColor: 'rgb(21, 21, 21)',
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
                  backgroundColor: 'transparent',
                  border: '1px solid rgb(52, 52, 52)',
                  color: 'white',
                }}
                placeholder="CodeSandbox URL"
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
      size: [w, h],
    } = this.props
    return <rect width={w} height={h} fill="transparent" />
  })

  validateProps = (props: Partial<NuCodeSandboxShapeProps>) => {
    if (props.size !== undefined) {
      props.size[0] = Math.max(props.size[0], 1)
      props.size[1] = Math.max(props.size[1], 1)
    }
    return withClampedStyles(props)
  }
}
