// TODO: provide "frontend.components.page/page" component?

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { TLBoxShape, TLBoxShapeProps } from '@tldraw/core'
import { HTMLContainer, TLComponentProps, useApp } from '@tldraw/react'
import { observer } from 'mobx-react-lite'
import { CustomStyleProps, withClampedStyles } from './style-props'
import { TextInput } from '~components/inputs/TextInput'
import { LogseqContext } from '~lib/logseq-context'
import CreatableSelect from 'react-select/creatable'

const PageInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const { search } = React.useContext(LogseqContext)
  const [q, setQ] = React.useState(value)

  const options = React.useMemo(() => {
    if (search && q) {
      return (search(q) ?? []).map(v => ({ value: v, label: v }))
    }
    return []
  }, [search, q])

  React.useEffect(() => {
    setQ(value)
  }, [value])

  return (
    <CreatableSelect
      isClearable
      placeholder="Search for pages..."
      options={options}
      value={options.find(o => o.value === q)}
      onChange={v => onChange(v?.value ?? '')}
      onInputChange={v => setQ(v)}
    />
  )
}

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

  canChangeAspectRatio = true
  canFlip = false
  canEdit = false

  ReactContextBar = observer(() => {
    const { pageId } = this.props
    const rInput = React.useRef<HTMLInputElement>(null)
    const app = useApp()

    const commitChange = React.useCallback((id: string) => {
      this.update({ pageId: id, size: LogseqPortalShape.defaultProps.size })
      app.persist()
      rInput.current?.blur()
    }, [])

    return (
      <div style={{ width: '200px' }}>
        <PageInput onChange={commitChange} value={pageId} />
      </div>
    )
  })

  ReactComponent = observer(({ events, isErasing }: TLComponentProps) => {
    const {
      props: { opacity, pageId },
    } = this

    const app = useApp()
    const { Page } = React.useContext(LogseqContext)
    const isSelected = app.selectedIds.has(this.id)

    const handlePointerDown = React.useCallback(e => {
      e.stopPropagation()
    }, [])

    if (!Page) {
      return null
    }

    return (
      <HTMLContainer
        style={{
          overflow: 'hidden',
          pointerEvents: 'all',
          opacity: isErasing ? 0.2 : opacity,
          border: '1px solid rgb(52, 52, 52)',
          backgroundColor: '#ffffff',
        }}
        {...events}
      >
        {pageId && (
          <div
            style={{
              height: '32px',
              width: '100%',
              background: '#bbb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {pageId}
          </div>
        )}
        <div
          style={{
            width: '100%',
            height: pageId ? 'calc(100% - 32px)' : '100%',
            pointerEvents: isSelected ? 'none' : 'all',
            userSelect: 'none',
          }}
        >
          {pageId ? (
            <div onPointerDown={handlePointerDown} style={{ padding: '0 24px' }}>
              <Page pageId={pageId} />
            </div>
          ) : (
            <div
              style={{
                opacity: isSelected ? 0.5 : 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                justifyContent: 'center',
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
      props.size[0] = Math.max(props.size[0], 50)
      props.size[1] = Math.max(props.size[1], 50)
    }
    return withClampedStyles(props)
  }
}
