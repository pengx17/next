// TODO: provide "frontend.components.page/page" component?

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLBoxShape, TLBoxShapeProps } from '@tldraw/core'
import { HTMLContainer, TLComponentProps } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'
import { TextInput } from '~components/inputs/TextInput'
import { LogseqContext } from '~lib/logseq-context'

export interface LogseqPortalShapeProps extends TLBoxShapeProps, CustomStyleProps {
  type: 'logseq-portal'
  pageId: string // page name or UUID
}

export class LogseqPortalShape extends TLBoxShape<LogseqPortalShapeProps> {
  static id = 'logseq-portal'

  static defaultProps: LogseqPortalShapeProps = {
    id: 'logseq-portal',
    type: 'logseq-portal',
    parentId: 'page',
    point: [0, 0],
    size: [600, 320],
    stroke: '#000000',
    fill: '#ffffff',
    strokeWidth: 2,
    opacity: 1,
    pageId: '',
  }

  aspectRatio = 480 / 853

  canChangeAspectRatio = true

  canFlip = false

  canEdit = true

  ReactContextBar = observer(() => {
    const { pageId } = this.props
    const rInput = React.useRef<HTMLInputElement>(null)
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const pageId = e.currentTarget.value
      this.update({ pageId })
    }, [])
    return (
      <>
        <TextInput
          ref={rInput}
          label="Page name or block UUID"
          type="text"
          value={pageId}
          onChange={handleChange}
        />
      </>
    )
  })

  ReactComponent = observer(({ events, isEditing, isErasing }: TLComponentProps) => {
    const {
      props: { opacity, pageId },
    } = this

    const { Page } = React.useContext(LogseqContext);
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
          {pageId ? (
            <Page pageId={pageId} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid rgb(52, 52, 52)',
                padding: 16,
              }}
            >
              LOGSEQ PORTAL PLACEHOLDER
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

  validateProps = (props: Partial<LogseqPortalShapeProps>) => {
    if (props.size !== undefined) {
      props.size[0] = Math.max(props.size[0], 1)
      props.size[1] = Math.max(props.size[0] * this.aspectRatio, 1)
    }
    return withClampedStyles(props)
  }
}
