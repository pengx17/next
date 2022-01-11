/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { Container } from '~components'
import type { TLReactShape } from '~lib'
import { useShapeEvents } from '~hooks/useShapeEvents'
import type { TLAsset } from '@tldraw/core'

interface ShapeProps {
  shape: TLReactShape
  asset?: TLAsset
  zIndex: number
  isHovered?: boolean
  isSelected?: boolean
  isBinding?: boolean
  isErasing?: boolean
  isEditing?: boolean
  meta: any
}

export const Shape = observer(function Shape({
  shape,
  zIndex,
  isHovered = false,
  isSelected = false,
  isBinding = false,
  isErasing = false,
  isEditing = false,
  asset,
  meta,
}: ShapeProps) {
  const {
    bounds,
    props: { rotation, scale },
    ReactComponent,
  } = shape

  const events = useShapeEvents(shape)

  return (
    <Container bounds={bounds} rotation={rotation} scale={scale} zIndex={zIndex}>
      <ReactComponent
        meta={meta}
        isEditing={isEditing}
        isBinding={isBinding}
        isHovered={isHovered}
        isSelected={isSelected}
        isErasing={isErasing}
        events={events}
        asset={asset}
      />
    </Container>
  )
})
